import { serve } from 'https://deno.land/std@0.137.0/http/server.ts';

export interface ReleaseInfo {
  id: string;
  version: string;
  short_version: string;
}

export interface DownloadInfo {
  download_url: string;
}

const REDIRECT = 302;
const NOT_FOUND = 404;

async function handler(req: Request): Promise<Response> {
  let url = new URL(req.url).pathname;

  if (!url || url === '/') {
    url = '/index.html';
  }

  if (/\.[a-z]+[a-z\d]*$/.test(url)) {
    return new Response(await Deno.readFile(`./public${url}`));
  }

  const matched = /\/([\w-]+)\/([\w-]+)\/([.\w]+)/.exec(url);

  if (!matched) {
    return new Response('Not Found', {
      status: NOT_FOUND,
    });
  }

  const [, owner, app, version] = matched;

  const releasesUrl =
    `https://install.appcenter.ms/api/v0.1/apps/${owner}/${app}/distribution_groups/public/public_releases`;

  console.log(`Fetching ${releasesUrl}`);

  const releases: ReleaseInfo[] = await fetch(releasesUrl).then((res) =>
    res.ok ? res.json() : []
  );

  const found = releases.find(
    (it) => it.version === version || it.short_version === version,
  );

  if (!found) {
    return new Response(
      `No matched version ${version} found for ${owner}/${app}`,
      {
        status: NOT_FOUND,
      },
    );
  }

  const releaseUrl =
    `https://install.appcenter.ms/api/v0.1/apps/${owner}/${app}/distribution_groups/public/releases/${found.id}`;

  console.log(`Fetching ${releaseUrl}`);

  const { download_url: downloadUrl }: DownloadInfo = await fetch(
    releaseUrl,
  ).then((res) => res.json());

  console.log(`Redirect to ${downloadUrl}`);

  return new Response(null, {
    status: REDIRECT,
    headers: {
      Location: downloadUrl,
    },
  });
}

serve(handler);
