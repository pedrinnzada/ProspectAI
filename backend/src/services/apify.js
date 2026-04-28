const axios = require('axios');

// Não lemos o token aqui — dotenv pode ainda não ter rodado
const ACTOR = 'compass/crawler-google-places';
const BASE_URL = 'https://api.apify.com/v2';

// Helper: garante que o token exista e o retorna
function getToken() {
  const token = process.env.APIFY_TOKEN;
  if (!token) throw new Error('APIFY_TOKEN não configurado. Adicione-o no .env (local) ou nas Environment Variables da Vercel.');
  return token;
}

// Detecta países para configurar countryCode
const BR_CITIES = ['belo horizonte','são paulo','rio de janeiro','curitiba','porto alegre',
  'brasília','brasilia','salvador','fortaleza','recife','manaus','belém','belem',
  'goiânia','goiania','florianópolis','florianopolis','vitória','vitoria','natal',
  'maceió','maceio','joão pessoa','joao pessoa','teresina','campo grande','cuiabá',
  'cuiaba','macapá','macapa','porto velho','rio branco','boa vista','palmas','aracaju',
  'são luís','sao luis','uberlândia','uberlandia','contagem','feira de santana','sorocaba'];

function isBrazil(city) {
  return BR_CITIES.some(c => city.toLowerCase().includes(c));
}

async function startRun(type, city, limit) {
  const body = {
    searchStringsArray: [type],
    locationQuery: city,
    maxCrawledPlacesPerSearch: limit,
    language: 'pt-BR',
  };
  if (isBrazil(city)) body.countryCode = 'br';

  const actorId = ACTOR.replace('/', '~');
  const res = await axios.post(
    `${BASE_URL}/acts/${actorId}/runs?token=${getToken()}`,
    body,
    { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
  );
  return res.data.data?.id;
}

async function pollRun(runId, maxAttempts = 40) {
  for (let i = 0; i < maxAttempts; i++) {
    await sleep(3000);
    const res = await axios.get(`${BASE_URL}/actor-runs/${runId}?token=${getToken()}`);
    const { status, defaultDatasetId } = res.data.data;

    if (status === 'SUCCEEDED') return defaultDatasetId;
    if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) {
      throw new Error(`Run ${status}`);
    }
  }
  throw new Error('Timeout: run demorou mais de 2 minutos');
}

async function getDataset(datasetId, limit) {
  const res = await axios.get(
    `${BASE_URL}/datasets/${datasetId}/items?token=${getToken()}&limit=${limit}`
  );
  return Array.isArray(res.data) ? res.data : [];
}

function mapItem(r, city, type) {
  return {
    name: r.title || r.name || 'Empresa',
    phone: r.phone || r.phoneUnformatted || '',
    address: r.address || r.street || '',
    city: r.city || city,
    website: r.website || '',
    rating: r.totalScore || r.rating || null,
    reviews: r.reviewsCount || 0,
    price: r.price || '',
    category: r.categoryName || type,
    mapUrl: r.url || `https://maps.google.com/?q=${encodeURIComponent((r.title || '') + ' ' + city)}`,
    searchQuery: `${type} em ${city}`,
    source: 'apify',
  };
}

async function scrape(type, city, limit) {
  getToken(); // valida logo no início antes de fazer qualquer chamada
  const runId = await startRun(type, city, limit);
  const datasetId = await pollRun(runId);
  const items = await getDataset(datasetId, limit);
  return items.map(r => mapItem(r, city, type));
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

module.exports = { scrape };
