const OpenAI = require('openai');
const { parse, addDays, addWeeks, startOfDay, setHours, setMinutes } = require('date-fns');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Parse natural language voice input to extract task details
 * @param {string} transcript - The transcribed voice input
 * @returns {Promise<Object>} Parsed task data
 */
async function parseVoiceInput(transcript) {
  try {
    const prompt = `Parse the following natural language task input and extract structured information. Return ONLY a valid JSON object with no additional text.

Input: "${transcript}"

Extract the following fields:
- title: The main task description (required, string)
- description: Any additional details (optional, string, can be empty)
- priority: One of: "Low", "Medium", "High", "Critical" (default: "Medium")
- dueDate: ISO 8601 date string if a specific date/time is mentioned, otherwise null (will default to tomorrow)
- status: One of: "To Do", "In Progress", "Done" (default: "To Do")

For dates, parse relative dates like:
- "tomorrow" -> tomorrow's date at 9:00 AM
- "today" -> today's date at 5:00 PM
- "next Monday" -> next Monday's date at 9:00 AM
- "in 3 days" or "3 days from now" -> 3 days from current date at 9:00 AM
- "until 3 days" -> 3 days from current date at 9:00 AM
- "by Friday" or "before Friday" -> next Friday at 9:00 AM
- "this weekend" or "end of week" -> this Friday at 5:00 PM
- "tomorrow evening" -> tomorrow at 6:00 PM
- "Monday" or "Tuesday" -> next occurrence of that day at 9:00 AM
- "15th January" or "Jan 20" -> absolute dates
- If no date mentioned -> set to tomorrow at 9:00 AM as default

For priority, identify keywords:
- "urgent", "critical", "high priority" -> "High" or "Critical"
- "low priority" -> "Low"
- Default to "Medium"

Return JSON format:
{
  "title": "string",
  "description": "string",
  "priority": "Low|Medium|High|Critical",
  "dueDate": "ISO8601 string or null",
  "status": "To Do|In Progress|Done"
}

Note: Only include dueDate if a specific date/time is explicitly mentioned in the input. If no date is mentioned, set dueDate to null.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that parses natural language task descriptions into structured JSON. Always return valid JSON only, no markdown, no explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const parsedData = JSON.parse(response.choices[0].message.content);

    // Process the due date string to a proper Date object
    let dueDate = null;
    if (parsedData.dueDate) {
      try {
        // Try to parse as ISO string first
        dueDate = new Date(parsedData.dueDate);
        if (isNaN(dueDate.getTime())) {
          // If that fails, try to parse relative dates
          dueDate = parseRelativeDate(parsedData.dueDate, transcript);
        }
      } catch (error) {
        console.error('Error parsing date:', error);
        dueDate = parseRelativeDate(parsedData.dueDate, transcript);
      }
    }

    // If no due date was found, default to tomorrow
    if (!dueDate) {
      dueDate = addDays(new Date(), 1);
      dueDate = setHours(dueDate, 9); // Default to 9 AM tomorrow
      dueDate = setMinutes(dueDate, 0);
    }

    return {
      title: parsedData.title || transcript,
      description: parsedData.description || '',
      priority: parsedData.priority || 'Medium',
      dueDate: dueDate,
      status: parsedData.status || 'To Do'
    };
  } catch (error) {
    console.error('Error parsing voice input:', error);
    
    // Fallback: return basic structure with defaults
    return {
      title: transcript,
      description: '',
      priority: 'Medium',
      dueDate: null,
      status: 'To Do'
    };
  }
}

/**
 * Parse relative date strings to Date objects
 * @param {string} dateString - Date string from AI or transcript
 * @param {string} transcript - Original transcript for context
 * @returns {Date|null}
 */
function parseRelativeDate(dateString, transcript) {
  const now = new Date();
  const lowerDateString = dateString.toLowerCase();
  const lowerTranscript = transcript.toLowerCase();

  // Check for "tomorrow"
  if (lowerDateString.includes('tomorrow') || lowerTranscript.includes('tomorrow')) {
    let date = addDays(now, 1);
    // Set default time to 9 AM unless evening is specified
    if (lowerTranscript.includes('evening') || lowerTranscript.includes('6 pm') || lowerTranscript.includes('6:00 pm')) {
      date = setHours(date, 18);
      date = setMinutes(date, 0);
    } else {
      date = setHours(date, 9);
      date = setMinutes(date, 0);
    }
    return date;
  }

  // Check for "today"
  if (lowerTranscript.includes('today')) {
    let date = new Date(now);
    if (lowerTranscript.includes('evening') || lowerTranscript.includes('6 pm') || lowerTranscript.includes('6:00 pm')) {
      date = setHours(date, 18);
      date = setMinutes(date, 0);
    } else {
      date = setHours(date, 17); // Default to 5 PM today
      date = setMinutes(date, 0);
    }
    return date;
  }

  // Check for "next [day]"
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < daysOfWeek.length; i++) {
    if (lowerTranscript.includes(`next ${daysOfWeek[i]}`)) {
      const targetDay = i;
      let date = addWeeks(now, 1);
      date.setDate(date.getDate() + (targetDay - date.getDay()));
      date = setHours(date, 9);
      date = setMinutes(date, 0);
      return date;
    }
  }

  // Check for specific day mentions (this Monday, Tuesday, etc.)
  for (let i = 0; i < daysOfWeek.length; i++) {
    const dayRegex = new RegExp(`\\b${daysOfWeek[i]}\\b`);
    if (dayRegex.test(lowerTranscript) && !lowerTranscript.includes(`next ${daysOfWeek[i]}`)) {
      const targetDay = i;
      let date = new Date(now);
      const currentDay = date.getDay();
      let daysUntil = (targetDay - currentDay + 7) % 7;

      // If the day is today and time hasn't passed, use today; otherwise next week
      if (daysUntil === 0 && date.getHours() < 17) {
        // Today but set to evening
        date = setHours(date, 17);
        date = setMinutes(date, 0);
      } else {
        // Next occurrence of this day
        if (daysUntil === 0) daysUntil = 7; // Next week if today has passed
        date = addDays(date, daysUntil);
        date = setHours(date, 9);
        date = setMinutes(date, 0);
      }
      return date;
    }
  }

  // Check for "in X days" or "X days from now"
  const daysMatch = lowerTranscript.match(/(?:in|within|after)\s+(\d+)\s+days?/);
  if (daysMatch) {
    const days = parseInt(daysMatch[1]);
    let date = addDays(now, days);
    date = setHours(date, 9);
    date = setMinutes(date, 0);
    return date;
  }

  // Check for "until X days" (same as in X days)
  const untilDaysMatch = lowerTranscript.match(/until\s+(\d+)\s+days?/);
  if (untilDaysMatch) {
    const days = parseInt(untilDaysMatch[1]);
    let date = addDays(now, days);
    date = setHours(date, 9);
    date = setMinutes(date, 0);
    return date;
  }

  // Check for "by [day]" or "before [day]"
  for (let i = 0; i < daysOfWeek.length; i++) {
    if (lowerTranscript.includes(`by ${daysOfWeek[i]}`) || lowerTranscript.includes(`before ${daysOfWeek[i]}`)) {
      const targetDay = i;
      let date = new Date(now);
      const daysUntil = (targetDay - date.getDay() + 7) % 7;
      date = addDays(date, daysUntil || 7);
      date = setHours(date, 9);
      date = setMinutes(date, 0);
      return date;
    }
  }

  // Check for "end of week" or "this weekend"
  if (lowerTranscript.includes('end of week') || lowerTranscript.includes('this weekend') || lowerTranscript.includes('weekend')) {
    let date = new Date(now);
    const daysUntilFriday = (5 - date.getDay() + 7) % 7;
    date = addDays(date, daysUntilFriday || 7);
    date = setHours(date, 17);
    date = setMinutes(date, 0);
    return date;
  }

  // Try to parse as ISO string or other date formats
  try {
    const parsed = new Date(dateString);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  } catch (error) {
    // Ignore
  }

  return null;
}

module.exports = { parseVoiceInput };

