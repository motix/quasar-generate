import { onRequest } from 'firebase-functions/v2/https';

declare module 'firebase-functions/v2/https' {
  export interface Request {
    body: {
      channel_name?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any;
    };
  }
}

export const slashProductionProject = onRequest((request, response) => {
  let channelName = request.body.channel_name!;

  if (channelName.startsWith('fn__')) {
    channelName = channelName.substring('fn__'.length);
  }

  response.status(200).send(`https://production.motiteam.com/projects/${channelName}`);
});
