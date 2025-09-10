import { reportWebVitals } from 'web-vitals';

// Function to report metrics to backend
const reportVitals = async (metric) => {
  console.log(metric); // Log for dev

  try {
    const response = await fetch(`${process.env.VITE_API_URL || 'http://localhost:5000/api'}/metrics/frontend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: metric.name, // e.g., LCP, CLS, FID
        value: metric.value,
        id: metric.id,
        delta: metric.delta,
        navigationType: metric.navigationType
      }),
      credentials: 'include' // For CORS with credentials
    });

    if (!response.ok) {
      console.error('Failed to send Web Vitals:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending Web Vitals:', error);
  }
};

// Report Web Vitals
reportWebVitals(reportVitals);

// Existing throttle code
const throttle = (func, delay) => {
  let lastCall = 0;
  return (...args) => {
    const now = new Date().getTime();
    if (now - lastCall < delay) return;
    lastCall = now;
    return func(...args);
  };
};

const throttledScroll = throttle(() => {
  // scrolled logic
}, 100);

export { throttle, throttledScroll, reportVitals };