import { test } from '@japa/runner';
import { apiVersion } from '../../../config';

test.group('API / Static / News', () => {
  test('returns a 404 response when the requested versions does not exist', async ({
    client,
  }) => {
    const response = await client.get(`/${apiVersion}/announcements/illegal`);

    response.assertStatus(404);
    response.assertTextIncludes('No announcement found.');
  });

  test('returns a 200 response with default version file when specifying version as input', async ({
    client,
  }) => {
    const response = await client.get(`/${apiVersion}/announcements/version`);

    response.assertStatus(200);
    response.assertBody({
      main: {
        headline: 'Example Announcement',
        subHeadline: 'Configure your announcement here',
        image: {
          light: 'https://api.ferdium.org/assets/feature/light.png',
          dark: 'https://api.ferdium.org/assets/feature/dark.png',
        },
        text: 'Long description here',
        cta: {
          label: 'Click here to do something',
          href: '/settings/app',
          analytics: {
            category: 'announcements-main',
            action: 'event',
            label: 'This does not get used',
          },
        },
      },
      spotlight: {
        title: 'Spotlight:',
        subject: 'Show another feature',
        text: 'Show another feature in the spotlight',
        cta: {
          label: 'Click here to do something',
          href: '/settings/team',
          analytics: {
            category: 'announcements-spotlight',
            action: 'event',
            label: 'This does not get used',
          },
        },
      },
    });
  });
});
