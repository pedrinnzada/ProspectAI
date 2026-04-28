const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: SUPABASE_URL ou SUPABASE_ANON_KEY não configurados no .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

function init() {
  console.log('✅ Conectado ao Supabase:', supabaseUrl);
}

module.exports = { supabase, init };
