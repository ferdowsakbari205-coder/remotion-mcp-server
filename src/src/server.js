import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';
import fs from 'fs';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {z} from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
app.use('/videos', express.static(outputDir));

let bundleLocation;
async function getBundle() {
  if (!bundleLocation) {
    bundleLocation = await bundle({
      entryPoint: path.join(__dirname, 'src', 'register.tsx'),
    });
  }
  return bundleLocation;
}

const mcpServer = new McpServer({name: 'remotion-mcp', version: '1.0.0'});

mcpServer.registerTool(
  'render_video',
  {
    title: 'Render a Remotion video',
    description:
      'Renders a short square video (1080x1080) with the given text and returns a downloadable URL.',
    inputSchema: {
      text: z.string().describe('Text to display in the video'),
    },
  },
  async ({text}) => {
    const bundleLoc = await getBundle();

    const composition = await selectComposition({
      serveUrl: bundleLoc,
      id: 'MyComp',
      inputProps: {text},
    });

    const fileName = `video-${Date.now()}.mp4`;
    const outputLocation = path.join(outputDir, fileName);

    await renderMedia({
      composition,
      serveUrl: bundleLoc,
      codec: 'h264',
      outputLocation,
      inputProps: {text},
    });

    const baseUrl = process.env.RENDER_EXTERNAL_URL || '';
    const publicUrl = `${baseUrl}/videos/${fileName}`;

    return {
      content: [{type: 'text', text: `ویدیو رندر شد: ${publicUrl}`}],
    };
  }
);

app.post('/mcp', async (req, res) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  res.on('close', () => transport.close());
  await mcpServer.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.get('/', (req, res) => {
  res.send('Remotion MCP server is running.');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
