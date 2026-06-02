// 48 teams qualified for FIFA World Cup 2026
// Crests from football-data.org CDN
const BASE = 'https://crests.football-data.org'

export const WC2026_TEAMS = [
  // CONMEBOL
  { name: 'Argentina', crest: `${BASE}/762.png` },
  { name: 'Brasil', crest: `${BASE}/764.png` },
  { name: 'Uruguay', crest: `${BASE}/773.png` },
  { name: 'Colombia', crest: `${BASE}/769.png` },
  { name: 'Ecuador', crest: `${BASE}/770.png` },
  { name: 'Venezuela', crest: `${BASE}/774.png` },
  { name: 'Chile', crest: `${BASE}/768.png` },
  { name: 'Paraguay', crest: `${BASE}/771.png` },
  { name: 'Bolivia', crest: `${BASE}/765.png` },
  { name: 'Perú', crest: `${BASE}/772.png` },
  // UEFA
  { name: 'Alemania', crest: `${BASE}/759.png` },
  { name: 'España', crest: `${BASE}/760.png` },
  { name: 'Francia', crest: `${BASE}/773.png` },
  { name: 'Inglaterra', crest: `${BASE}/770.png` },
  { name: 'Portugal', crest: `${BASE}/765.png` },
  { name: 'Países Bajos', crest: `${BASE}/749.png` },
  { name: 'Bélgica', crest: `${BASE}/2721.png` },
  { name: 'Italia', crest: `${BASE}/784.png` },
  { name: 'Croacia', crest: `${BASE}/799.png` },
  { name: 'Suiza', crest: `${BASE}/788.png` },
  { name: 'Austria', crest: `${BASE}/816.png` },
  { name: 'Turquía', crest: `${BASE}/803.png` },
  { name: 'Polonia', crest: `${BASE}/806.png` },
  { name: 'Hungría', crest: `${BASE}/827.png` },
  { name: 'Eslovaquia', crest: `${BASE}/834.png` },
  { name: 'Serbia', crest: `${BASE}/839.png` },
  { name: 'Eslovenia', crest: `${BASE}/838.png` },
  { name: 'Grecia', crest: `${BASE}/793.png` },
  { name: 'Ucrania', crest: `${BASE}/790.png` },
  { name: 'Rumania', crest: `${BASE}/811.png` },
  { name: 'Albania', crest: `${BASE}/835.png` },
  { name: 'República Checa', crest: `${BASE}/798.png` },
  // CONCACAF
  { name: 'México', crest: `${BASE}/764.png` },
  { name: 'Estados Unidos', crest: `${BASE}/765.png` },
  { name: 'Canadá', crest: `${BASE}/780.png` },
  { name: 'Costa Rica', crest: `${BASE}/799.png` },
  { name: 'Honduras', crest: `${BASE}/801.png` },
  { name: 'Panamá', crest: `${BASE}/813.png` },
  // CAF
  { name: 'Marruecos', crest: `${BASE}/785.png` },
  { name: 'Senegal', crest: `${BASE}/836.png` },
  { name: 'Camerún', crest: `${BASE}/781.png` },
  { name: 'Ghana', crest: `${BASE}/792.png` },
  { name: 'Egipto', crest: `${BASE}/783.png` },
  { name: 'Argelia', crest: `${BASE}/775.png` },
  // AFC
  { name: 'Japón', crest: `${BASE}/786.png` },
  { name: 'Corea del Sur', crest: `${BASE}/772.png` },
  { name: 'Arabia Saudita', crest: `${BASE}/776.png` },
  { name: 'Australia', crest: `${BASE}/779.png` },
].sort((a, b) => a.name.localeCompare(b.name))
