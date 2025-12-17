import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import DodoPayments from 'dodopayments';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ Missing Supabase credentials in .env");
}

export const supabase = createClient(supabaseUrl || "", supabaseKey || "");

// Dodo Payments Setup
const dodo = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY, 
  mode: process.env.DODO_PAYMENTS_MODE || (process.env.DODO_PAYMENTS_API_KEY?.startsWith('test_') ? 'test' : 'live')
});

// Routes
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "StayOnX API" });
});

// Ads Config Endpoint - Returns active ads for rotation
app.get("/api/ads/config", async (req, res) => {
  try {
    const now = new Date().toISOString();
    // console.log('Fetching ads at:', now);
    
    // Query active sponsors
    const { data, error } = await supabase
      .from("sponsors")
      .select("*")
      .eq("active", true);

    if (error) throw error;
    
    // console.log('Total active sponsors in DB:', data?.length || 0);
    // if (data?.length > 0) {
    //   console.log('First sponsor:', JSON.stringify(data[0], null, 2));
    // }

    // Filter by: submitted (has content), date range
    const validAds = (data || []).filter(ad => {
      // Must have been actually submitted with content
      if (!ad.submitted_at || !ad.title || ad.title.trim() === '') return false;
      
      const startsAt = ad.starts_at ? new Date(ad.starts_at) : null;
      const endsAt = ad.ends_at ? new Date(ad.ends_at) : null;
      const nowDate = new Date();
      
      // If no dates set, consider it valid
      if (!startsAt || !endsAt) return true;
      
      return startsAt <= nowDate && endsAt >= nowDate;
    });
    
    // console.log('Ads after filtering:', validAds.length);

    // No cache - ads should update immediately
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");

    const MAX_SLOTS = 5;
    const activeAds = [...validAds];
    
    // Rotation logic:
    // - If < 5 paid slots, include default "slot available" ad in rotation
    // - If all 5 slots are filled, only rotate among the 5 paid ads
    if (activeAds.length < MAX_SLOTS) {
      activeAds.push({
        id: 'default',
        sponsor_name: 'StayOnX Partner',
        title: 'Advertise your brand here',
        description: 'Reach thousands of engaged users with a native, non-intrusive placement.',
        cta_text: 'Secure your slot',
        cta_url: 'https://stayonx.app/advertise',
        image_url: 'https://stayonx.app/assets/ad-default.png'
      });
    }
    
    // console.log('Total ads in rotation:', activeAds.length);

    res.json(activeAds);
  } catch (err) {
    console.error("Error fetching ads:", err);
    res.status(500).json({ error: "Failed to fetch ads" });
  }
});

// Check Ad Availability
app.get('/api/ads/availability', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('sponsors')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)
      .lte('starts_at', new Date().toISOString())
      .gte('ends_at', new Date().toISOString());

    if (error) throw error;

    const MAX_SLOTS = 5;
    const available = (count || 0) < MAX_SLOTS;
    
    res.json({ 
      available, 
      count: count || 0,
      max: MAX_SLOTS
    });
  } catch (err) {
    console.error('Error checking availability:', err);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

// Record Ad Impression (deduplicated by user)
app.post('/api/ads/impression', async (req, res) => {
  try {
    const { adId, visitorId } = req.body;
    
    if (!adId || !visitorId) {
      return res.status(400).json({ error: 'Missing adId or visitorId' });
    }
    
    // Skip tracking for default/placeholder ad
    if (adId === 'default') {
      return res.json({ success: true, skipped: true });
    }

    // Check if this visitor already has an impression for this ad
    const { data: existing } = await supabase
      .from('ad_impressions')
      .select('id')
      .eq('ad_id', adId)
      .eq('visitor_id', visitorId)
      .single();

    if (existing) {
      return res.json({ success: true, duplicate: true });
    }

    // Record new impression
    await supabase.from('ad_impressions').insert({
      ad_id: adId,
      visitor_id: visitorId
    });

    // Update impression count on sponsor
    await supabase.rpc('increment_impressions', { sponsor_id: adId });

    res.json({ success: true });
  } catch (err) {
    console.error('Error recording impression:', err);
    res.status(500).json({ error: 'Failed to record impression' });
  }
});

// Record Ad Click
app.post('/api/ads/click', async (req, res) => {
  try {
    const { adId, visitorId } = req.body;
    
    if (!adId) {
      return res.status(400).json({ error: 'Missing adId' });
    }
    
    // Skip tracking for default/placeholder ad
    if (adId === 'default') {
      return res.json({ success: true, skipped: true });
    }

    // Record click
    await supabase.from('ad_clicks').insert({
      ad_id: adId,
      visitor_id: visitorId || null
    });

    // Update click count on sponsor
    await supabase.rpc('increment_clicks', { sponsor_id: adId });

    res.json({ success: true });
  } catch (err) {
    console.error('Error recording click:', err);
    res.status(500).json({ error: 'Failed to record click' });
  }
});

// Get Ad Stats
app.get('/api/ads/stats/:adId', async (req, res) => {
  try {
    const { adId } = req.params;

    const { data, error } = await supabase
      .from('sponsors')
      .select('impressions, clicks')
      .eq('id', adId)
      .single();

    if (error) throw error;

    const impressions = data?.impressions || 0;
    const clicks = data?.clicks || 0;
    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : 0;

    res.json({ impressions, clicks, ctr });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});


// Create Dodo Payment Session
app.post('/api/payment/create-session', async (req, res) => {
  try {
    const productId = process.env.DODO_PRODUCT_ID;
    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    const isTest = process.env.DODO_PAYMENTS_MODE === 'test';
    
    if (!productId || !apiKey) {
      return res.status(500).json({ error: 'Server misconfiguration: Missing Keys' });
    }

    const origin = req.headers.origin || 'http://localhost:5173';
    
    // Direct fetch call to bypass SDK issues
    const baseUrl = isTest ? 'https://test.dodopayments.com' : 'https://live.dodopayments.com';
    
    const response = await fetch(`${baseUrl}/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product_cart: [
          { product_id: productId, quantity: 1 }
        ],
        billing: {
          city: "New York",
          country: "US", 
          state: "NY",
          street: "123 Street",
          zipcode: "10001"
        },
        customer: {
          email: "guest@example.com",
          name: "Guest User"
        },
        return_url: `${origin}/ads/submit`
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Dodo API Error:', response.status, errorText);
        return res.status(response.status).json({ error: 'Dodo API failed', details: errorText });
    }

    const session = await response.json();
    res.json(session);
  } catch (err) {
    console.error('Error creating payment session:', err);
    res.status(500).json({ error: 'Failed to create payment session' });
  }
});

// Verify Payment (accepts session_id from redirect URL)
app.get('/api/payment/verify/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // console.log('Verifying session ID:', sessionId);
    
    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    const isTest = process.env.DODO_PAYMENTS_MODE === 'test';
    const baseUrl = isTest ? 'https://test.dodopayments.com' : 'https://live.dodopayments.com';

    // console.log('Using base URL:', baseUrl);
    // console.log('Fetching checkout session from:', `${baseUrl}/checkouts/${sessionId}`);

    // 1. First, try to fetch the checkout session
    let checkoutResponse = await fetch(`${baseUrl}/checkouts/${sessionId}`, {
         headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    // If first endpoint fails, try alternate endpoint format
    if (!checkoutResponse.ok) {
         // console.log('First endpoint failed, trying /checkout-sessions/');
         checkoutResponse = await fetch(`${baseUrl}/checkout-sessions/${sessionId}`, {
              headers: { 'Authorization': `Bearer ${apiKey}` }
         });
    }
    
    if (!checkoutResponse.ok) {
         const errorText = await checkoutResponse.text();
         console.error('Checkout session fetch failed:', errorText);
         
         // For test mode, allow proceed anyway since payment was shown as successful
         if (isTest) {
           // console.log('Test mode: allowing proceed despite session fetch failure');
           // Check if sponsor record already exists
           const { data: existing } = await supabase
             .from('sponsors')
             .select('*')
             .eq('payment_id', sessionId)
             .single();

           // If record exists and has submitted_at, it's already been used
           if (existing && existing.submitted_at) {
             console.log('Payment already used for submission:', sessionId);
             return res.json({ valid: false, alreadySubmitted: true });
           }

           if (!existing) {
              console.log('Creating new sponsor record for payment:', sessionId);
              const { error: insertError } = await supabase.from('sponsors').insert({
                 payment_id: sessionId,
                 sponsor_name: 'Pending',
                 title: '',  // Required NOT NULL, will be filled on submit
                 description: '',
                 cta_text: 'Secure your slot',
                 cta_url: '',
                 image_url: '',
                 email: '',
                 active: false, // Not active until ad is submitted
                 starts_at: new Date().toISOString(),
                 ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
              });
              if (insertError) {
                console.error('Failed to create sponsor record:', insertError);
                return res.status(500).json({ error: 'Failed to create sponsor record', details: insertError.message });
              }
              console.log('Sponsor record created successfully');
           }
           
           return res.json({ valid: true, testMode: true, alreadySubmitted: false });
         }
         
         return res.status(400).json({ error: 'Checkout session not found' });
    }

    const checkout = await checkoutResponse.json();
    
    // Check if checkout has a payment_id (meaning payment was completed)
    const paymentId = checkout.payment_id;
    
    if (!paymentId) {
      // Payment might still be processing or failed
      console.log('Checkout session status:', checkout.status);
      
      // If status indicates completion, we can proceed even without verifying payment details
      if (checkout.status === 'complete' || checkout.status === 'succeeded') {
        // Check if sponsor record already exists
        const { data: existing } = await supabase
          .from('sponsors')
          .select('*')
          .eq('payment_id', sessionId)
          .single();

        // If record exists and has submitted_at, it's already been used
        if (existing && existing.submitted_at) {
          console.log('Payment already used for submission:', sessionId);
          return res.json({ valid: false, alreadySubmitted: true });
        }

        if (!existing) {
           console.log('Creating new sponsor record for payment:', sessionId);
           const { error: insertError } = await supabase.from('sponsors').insert({
              payment_id: sessionId,
              sponsor_name: checkout.customer?.name || 'Pending',
              title: '',
              description: '',
              cta_text: 'Secure your slot',
              cta_url: '',
              image_url: '',
              email: checkout.customer?.email || '',
              active: false,
              starts_at: new Date().toISOString(),
              ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
           });
           if (insertError) {
             console.error('Failed to create sponsor record:', insertError);
             return res.status(500).json({ error: 'Failed to create sponsor record' });
           }
           console.log('Sponsor record created successfully');
        }
        
        return res.json({ valid: true, checkout, alreadySubmitted: false });
      }
      
      return res.status(400).json({ error: 'Payment not yet completed', status: checkout.status });
    }

    // 2. If we have payment_id, verify the payment directly
    const paymentResponse = await fetch(`${baseUrl}/payments/${paymentId}`, {
         headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    if (!paymentResponse.ok) {
         console.error('Payment verification failed:', await paymentResponse.text());
         return res.status(400).json({ error: 'Payment verification failed' });
    }

    const payment = await paymentResponse.json();
    
    if (payment.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not successful', status: payment.status });
    }

    // 3. Check if sponsor record already exists
    const { data: existing } = await supabase
      .from('sponsors')
      .select('*')
      .eq('payment_id', sessionId)
      .single();

    // If record exists and has submitted_at, it's already been used
    if (existing && existing.submitted_at) {
      console.log('Payment already used for submission:', sessionId);
      return res.json({ valid: false, alreadySubmitted: true });
    }

    if (!existing) {
       console.log('Creating new sponsor record for payment:', sessionId);
       const { error: insertError } = await supabase.from('sponsors').insert({
          payment_id: sessionId,
          sponsor_name: payment.customer?.name || checkout.customer?.name || 'Pending',
          title: '',
          description: '',
          cta_text: 'Secure your slot',
          cta_url: '',
          image_url: '',
          email: payment.customer?.email || checkout.customer?.email || '',
          active: false,
          starts_at: new Date().toISOString(),
          ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
       });
       if (insertError) {
         console.error('Failed to create sponsor record:', insertError);
         return res.status(500).json({ error: 'Failed to create sponsor record' });
       }
       console.log('Sponsor record created successfully');
    }

    res.json({ valid: true, payment, alreadySubmitted: false });
  } catch (err) {
    console.error('Error verifying payment:', err);
    res.status(500).json({ error: 'Failed to verify payment', details: err.message });
  }
});

// Ad Submission Endpoint:
app.post('/api/ads/submit', async (req, res) => {
  try {
    const { paymentId, sponsorName, title, description, ctaText, ctaUrl, imageUrl, email } = req.body;

    if (!paymentId || !sponsorName || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if row exists (from verification or webhook)
    const { data: existing } = await supabase
      .from('sponsors')
      .select('*')
      .eq('payment_id', paymentId)
      .single();

    // SECURITY: Check if ad was already submitted for this payment
    if (existing && existing.submitted_at) {
      return res.status(400).json({ 
        error: 'Ad already submitted for this payment',
        alreadySubmitted: true
      });
    }

    // SECURITY: If no record exists, payment wasn't verified
    if (!existing) {
      return res.status(400).json({ 
        error: 'Invalid payment ID - payment not verified',
        invalidPayment: true
      });
    }

    // Update existing row with ad details
    const result = await supabase
      .from('sponsors')
      .update({ 
        sponsor_name: sponsorName,
        title, 
        description, 
        cta_text: ctaText, 
        cta_url: ctaUrl, 
        image_url: imageUrl,
        email,
        active: true,
        submitted_at: new Date().toISOString(), // Mark as submitted
        starts_at: existing.starts_at || new Date().toISOString(),
        ends_at: existing.ends_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('payment_id', paymentId);

    if (result.error) throw result.error;

    res.json({ success: true });
  } catch (err) {
    console.error('Error submitting ad:', err);
    res.status(500).json({ error: 'Failed to submit ad' });
  }
});

// Webhook Endpoint for DodoPayments
app.post('/api/webhooks/dodo', async (req, res) => {
  try {
    const payload = req.body;
    // Log the payload for debugging
    console.log('Webhook received:', JSON.stringify(payload, null, 2));

    // TODO: Verify Signature from headers (req.headers['x-dodo-signature']?)
    
    // Check for payment.succeeded event
    // Note: Adjust based on actual Dodo payload structure
    if (payload.type === 'payment.succeeded') {
      const { paymentId, customerEmail, metadata } = payload.data; 
      
      // If we passed the ad ID in metadata, we can activate it
      // For "Guest Checkout", we might match by paymentId if we stored it first
      
      if (paymentId) {
        const { error } = await supabase
          .from('sponsors')
          .update({ active: true, starts_at: new Date().toISOString() }) // Activate immediately
          .eq('payment_id', paymentId);

        if (error) {
          console.error('Failed to activate ad:', error);
          return res.status(500).send('Error updating database');
        }
      }
    }

    res.status(200).send('Webhook received');
  } catch (err) {
    console.error('Webhook Error:', err);
    res.status(400).send('Webhook failed');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
