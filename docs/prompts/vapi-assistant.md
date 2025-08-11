# Phone Collection System Documentation

## Overview
The Yo Tengo Por Voy project uses an automated phone system to collect family stories and memories about Everett & Emma Gene Ulrich's journey from Tampico, Illinois to Costa Rica in 1968. Family members can call **(618) 376-7869** (618-3-PORVOY) to share their memories with an AI assistant.

## System Architecture

```
Caller → Twilio Phone Number → Vapi AI Assistant → Supabase Edge Function → Database
```

### Components

1. **Twilio**: Provides the phone number and telephony infrastructure
2. **Vapi**: AI voice assistant platform that handles conversations
3. **Supabase**: Database and edge functions for storing recordings
4. **Next.js Frontend**: Displays collected stories at yotengoporvoy.wiki

## Setup Guide

### 1. Twilio Configuration

The phone number **(618) 376-7869** was purchased through Vapi, which automatically configures Twilio webhooks.

**Important**: Do NOT modify Twilio webhook settings - they should point to Vapi's servers:
- Webhook URL: `https://api.vapi.ai/twilio/inbound` (or similar)
- Method: HTTP POST

### 2. Vapi Configuration

#### A. Create Assistant

1. Go to Vapi Dashboard → Assistants
2. Create new assistant named "Riley" or similar
3. Model: Claude 3.5 Sonnet (`claude-sonnet-4-20250514`)
4. Voice: 11Labs voice with warm, patient tone
5. Paste the system prompt (see `prompts/vapi-assistant.md`)

#### B. Phone Number Settings

In Vapi → Phone Numbers → (618) 376-7869:

```
Phone Number Label: Yo Tengo Por Voy
SMS Enabled: Yes
Server URL: https://[YOUR-PROJECT-ID].supabase.co/functions/v1/twilio-call
Timeout Seconds: 30
Headers: None needed (using service role key internally)
```

#### C. Assistant Settings

- **Recording**: ON
- **Transcription**: ON (Deepgram Nova-3)
- **End of Call Report**: ON
- **Analysis**: Summary + Success Evaluation

### 3. Supabase Edge Function

#### A. Create Function

File: `supabase/functions/twilio-call/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()
    console.log('Vapi webhook received:', payload)

    // Check for Vapi's end-of-call-report
    if (payload.message?.type === 'end-of-call-report') {
      const { message } = payload
      
      // Extract transcript
      const messages = message.artifact?.messages || []
      const transcript = message.artifact?.transcript || 
                        messages.map(m => m.message || '').join('\n') || 
                        'No transcript available'
      
      // Get call summary
      const summary = message.analysis?.summary || ''
      
      // Extract caller name from summary
      const callerName = extractCallerName(summary) || 'Anonymous Caller'
      
      // Save to database
      const { data, error } = await supabase
        .from('content_items')
        .insert({
          type: 'audio_recording',
          source: 'twilio_call',
          title: `Phone Story from ${callerName}`,
          description: summary,
          content_text: transcript,
          contributor_name: callerName,
          contributor_phone: message.customer?.number || null,
          is_public: false,  // Start private for review
          is_sensitive: false,
          processing_status: 'pending',
          source_details: {
            call_id: message.call?.id,
            timestamp: message.timestamp,
            success: message.analysis?.successEvaluation,
            summary: summary,
            recorded_at: new Date(message.timestamp).toISOString(),
            recording_method: 'vapi_twilio',
            recording_url: message.recordingUrl,
            stereo_recording_url: message.stereoRecordingUrl,
            duration_seconds: message.durationSeconds,
            cost: message.cost,
            full_payload: message
          },
          ai_summary: summary,
          metadata: {
            source: 'twilio_vapi',
            phone_number: '(618) 376-7869',
          }
        })

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      console.log('Successfully saved phone story from:', callerName)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

function extractCallerName(summary: string): string {
  const match = summary.match(/^([^,]+),/);
  return match ? match[1].trim() : '';
}
```

#### B. Deploy Function

In Supabase Dashboard:
1. Edge Functions → New Function
2. Name: `twilio-call`
3. Paste code above
4. Deploy

### 4. Database Schema

The phone recordings are stored in the `content_items` table:

```sql
-- Phone recordings use these fields:
type: 'audio_recording'  -- content_type enum
source: 'twilio_call'     -- content_source enum
title: 'Phone Story from [Name]'
description: [AI-generated summary]
content_text: [Full transcript]
contributor_name: [Extracted from call]
contributor_phone: [Caller's phone number]
is_public: false  -- Starts private for family review
processing_status: 'pending'
source_details: {
  call_id: [Vapi call ID]
  recording_url: [Audio URL at Vapi]
  duration_seconds: [Call length]
  summary: [AI summary]
  -- Plus full Vapi payload
}
```

## Vapi Webhook Payload Structure

When a call ends, Vapi sends this structure:

```json
{
  "message": {
    "type": "end-of-call-report",
    "timestamp": 1754881612922,
    "call": {
      "id": "call-uuid",
      "customer": {
        "number": "+18179071029"
      }
    },
    "analysis": {
      "summary": "Eugene Ulrich, grandson of Everett...",
      "successEvaluation": "true"
    },
    "artifact": {
      "transcript": "AI: Hello... User: My name is...",
      "messages": [/* Full conversation array */]
    },
    "recordingUrl": "https://storage.vapi.ai/...",
    "durationSeconds": 260
  }
}
```

## Frontend Integration

### Displaying Phone Recordings

In `app/browse/page.tsx`:
- Phone recordings have `source: 'twilio_call'`
- Audio URLs are in `source_details.recording_url`
- Full transcript in `content_text`

### Admin Review

Since phone recordings start with `is_public: false`:

```typescript
// Get pending phone recordings for review
const { data: pendingCalls } = await supabase
  .from('content_items')
  .select('*')
  .eq('source', 'twilio_call')
  .eq('is_public', false)
  .order('created_at', { ascending: false });
```

## Testing

### Test Call Flow

1. Call **(618) 376-7869**
2. AI assistant answers with warm greeting
3. Share your name and connection
4. Share memories (or test with brief info)
5. Hang up

### Verify Data Storage

```sql
-- Check latest phone recording
SELECT * FROM content_items 
WHERE source = 'twilio_call' 
ORDER BY created_at DESC 
LIMIT 1;
```

### Monitor Logs

- **Vapi**: Dashboard → Calls → View details
- **Supabase**: Edge Functions → twilio-call → Logs
- **Database**: Check `content_items` table

## Cost Breakdown

Per call costs (approximate):
- Twilio: $0.013/minute
- Vapi: $0.05/minute base
- Transcription: $0.01/minute
- AI Model: ~$0.03 per call
- Voice synthesis: ~$0.20 per call
- **Total**: ~$0.50 per 5-minute call

## Troubleshooting

### Call doesn't connect
- Check Twilio number is active
- Verify Vapi assistant is assigned to number
- Check Twilio account has credits

### No data in database
- Check Edge Function logs for errors
- Verify webhook URL in Vapi matches Edge Function
- Check for `message.type === 'end-of-call-report'`
- Ensure SERVICE_ROLE_KEY is available in Edge Function

### Audio not playing
- Vapi stores recordings on their CDN
- URLs expire after some time
- Consider downloading and storing in Supabase Storage

### Transcript issues
- Ensure transcription is enabled in Vapi
- Check for heavy accents or poor connection
- Review Deepgram settings in Vapi

## Security Considerations

1. **Phone numbers**: Stored but consider privacy
2. **Private by default**: All phone recordings start as `is_public: false`
3. **Family review**: Implement admin review before making public
4. **Sensitive content**: Flag system for sensitive memories
5. **GDPR/Privacy**: Consider consent in greeting message

## Future Enhancements

- [ ] Download recordings from Vapi to Supabase Storage
- [ ] Automatic transcription cleanup
- [ ] Multi-language support (Spanish)
- [ ] SMS follow-up for contributors
- [ ] Callback system for longer stories
- [ ] Integration with other family history projects

## Support

For issues or questions:
- Check Edge Function logs
- Review Vapi call details
- Database queries in Supabase SQL editor
- Frontend debugging in browser console

---

*Last updated: January 2025*
*Phone number: (618) 376-7869 / 618-3-PORVOY*
*Website: yotengoporvoy.wiki*
