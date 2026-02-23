# Event RSVP Mock Data for MongoDB

## Event RSVPs Collection
```json
[
  {
    "_id": "rsvp_001",
    "userId": "user_001",
    "eventId": "event_001",
    "status": "GOING"
  },
  {
    "_id": "rsvp_002", 
    "userId": "user_002",
    "eventId": "event_001",
    "status": "GOING"
  },
  {
    "_id": "rsvp_003",
    "userId": "user_003", 
    "eventId": "event_002",
    "status": "MAYBE"
  }
]
```

## Import Instructions

### Using mongosh:
```bash
mongosh mongodb://localhost:27017/alumni_connect
use alumni_connect
db.event_rsvps.insertMany([
  {
    "_id": "rsvp_001",
    "userId": "user_001", 
    "eventId": "event_001",
    "status": "GOING"
  },
  {
    "_id": "rsvp_002",
    "userId": "user_002",
    "eventId": "event_001", 
    "status": "GOING"
  },
  {
    "_id": "rsvp_003",
    "userId": "user_003",
    "eventId": "event_002",
    "status": "MAYBE"
  }
])
```

### Using MongoDB Compass:
1. Open MongoDB Compass and connect to your database
2. Select the 'alumni_connect' database  
3. Click on the 'event_rsvps' collection
4. Click 'Insert Document' → 'Array' view
5. Paste the RSVP array and click 'Insert'

## What This Does:
- **user_001** and **user_002** will see **event_001** in their dashboard (Annual Alumni Reunion)
- **user_003** will see **event_002** with MAYBE status (Tech Talk: Future of AI)

## Testing RSVP Functionality:
```bash
# RSVP to an event
curl -X POST http://localhost:8080/events/event_001/rsvp \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "GOING"}'

# Check dashboard events
curl -X GET http://localhost:8080/dashboard/events \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Debugging Added:
I've added logging to the backend to help debug:
1. **DashboardController** - Logs user ID and number of events found
2. **EventService** - Logs RSVP queries and processing
3. **RSVP method** - Logs when RSVPs are created/updated

Check your backend logs to see:
- "Getting events for user: [userId]"
- "Found X RSVPs with GOING status for user: [userId]"  
- "Saved RSVP with ID: [rsvpId]"

If RSVPs still don't show up, the logs will tell us exactly where the issue is!
