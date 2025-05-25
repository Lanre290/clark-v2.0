import '@tensorflow/tfjs-node'; // Register native backend first
import * as use from '@tensorflow-models/universal-sentence-encoder';
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY as string,
});

const index = pinecone.index(
  process.env.PINECONE_INDEX_NAME as string,
  process.env.PINECONE_INDEX_HOST as string
);

let model: use.UniversalSentenceEncoder | null = null;

async function initModel() {
  if (!model) {
    model = await use.load();
  }
}

export async function getEmbedding(text: string): Promise<number[]> {
  await initModel();
  if (!model) throw new Error('Model not loaded');
  const embeddings = await model.embed([text]);
  const array = await embeddings.array();
  embeddings.dispose();
  return array[0];
}

export async function storeVector(
  text: string,
  metadata: Record<string, any>,
  workspace_id: string
) {
  const vector = await getEmbedding(text);
  const id = `doc-${Date.now()}`;

  await index.upsert([
    {
      id,
      values: vector,
      metadata: {
        text,
        workspace_id,
        ...metadata,
      },
    },
  ]);

  return { success: true, id };
}

export async function searchVector(
  query: string,
  topK = 5,
  workspace_id: string
) {
  const vector = await getEmbedding(query);

  const queryResponse = await index.query({
    vector,
    topK,
    includeMetadata: true,
    filter: {
      workspace_id,
    },
  });
  

  return queryResponse.matches || [];
}
