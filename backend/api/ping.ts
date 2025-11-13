// Simple serverless function that returns an "active" response.
// This is useful as a lightweight health check at /. For this backend project
// the function will be available at https://<your-backend>.vercel.app/api/ping

export default function handler(_req: any, res: any) {
  void _req;
  res.status(200).json({
    status: 'ok',
    message: 'Supply Chain API is active',
    timestamp: new Date().toISOString(),
  });
}
