import PusherClient from 'pusher-js';

const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || 'dummy';
const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1';

export const pusherClient = new PusherClient(
  pusherKey,
  {
    cluster: cluster,
  }
);
