const ITEM_PT = {
  'thunder-stone': 'Pedra Trovão',
  'fire-stone': 'Pedra Fogo',
  'water-stone': 'Pedra Água',
  'leaf-stone': 'Pedra Folha',
  'moon-stone': 'Pedra Lua',
  'sun-stone': 'Pedra Sol',
  'shiny-stone': 'Pedra Brilhante',
  'dusk-stone': 'Pedra Noturna',
  'dawn-stone': 'Pedra Aurora',
  'ice-stone': 'Pedra Gelo',
  'oval-stone': 'Pedra Oval',
  'kings-rock': 'Rocha do Rei',
  'metal-coat': 'Casaco de Metal',
  'dragon-scale': 'Escama Dragão',
  'upgrade': 'Upgrade',
  'dubious-disc': 'Disco Suspeito',
  'protector': 'Protetor',
  'electirizer': 'Eletrizador',
  'magmarizer': 'Magmarizador',
  'razor-claw': 'Garra Afiada',
  'razor-fang': 'Presa Afiada',
  'reaper-cloth': 'Pano do Ceifador',
  'prism-scale': 'Escama Prisma',
  'whipped-dream': 'Sonho Batido',
  'sachet': 'Sachê',
  'linking-cord': 'Cordão de Ligação',
  'black-augurite': 'Augurita Negra',
  'peat-block': 'Bloco de Turfa',
  'malicious-armor': 'Armadura Maliciosa',
  'auspicious-armor': 'Armadura Auspiciosa',
  'leaders-crest': 'Crista do Líder',
  'gimmighoul-coin': 'Moeda Gimmighoul',
  'sweet-apple': 'Maçã Doce',
  'tart-apple': 'Maçã Azeda',
  'syrupy-apple': 'Maçã Açucarada',
  'scroll-of-darkness': 'Pergaminho das Trevas',
  'scroll-of-waters': 'Pergaminho das Águas',
  'unremarkable-teacup': 'Xícara Comum',
  'masterpiece-teacup': 'Xícara Obra-Prima',
  'chipped-pot': 'Panela Lascada',
  'cracked-pot': 'Panela Rachada',
  'metal-alloy': 'Liga Metálica',
  'star-piece': 'Estilhaço Estelar',
  'deep-sea-scale': 'Escama Mar Fundo',
  'deep-sea-tooth': 'Dente Mar Fundo',
}

const TYPE_PT = {
  normal: 'Normal', fire: 'Fogo', water: 'Água', grass: 'Planta',
  electric: 'Elétrico', ice: 'Gelo', fighting: 'Lutador', poison: 'Veneno',
  ground: 'Terra', flying: 'Voador', psychic: 'Psíquico', bug: 'Inseto',
  rock: 'Pedra', ghost: 'Fantasma', dragon: 'Dragão', dark: 'Sombrio',
  steel: 'Metálico', fairy: 'Fada',
}

function itemName(slug) {
  return ITEM_PT[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function typeName(slug) {
  return TYPE_PT[slug] || slug
}

function pokeName(slug) {
  return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')
}

export function formatEvolutionMethod(details) {
  if (!details || details.length === 0) return null
  const d = details[0]
  const trigger = d.trigger?.name
  const parts = []

  switch (trigger) {
    case 'level-up':
      if (d.min_level) parts.push(`Nível ${d.min_level}`)
      else parts.push('Subir de nível')
      break
    case 'use-item':
      if (d.item?.name) parts.push(`Usar ${itemName(d.item.name)}`)
      else parts.push('Usar item')
      break
    case 'trade':
      if (d.trade_species?.name) parts.push(`Troca com ${pokeName(d.trade_species.name)}`)
      else if (d.held_item?.name) parts.push(`Troca + ${itemName(d.held_item.name)}`)
      else parts.push('Troca')
      break
    case 'shed':
      parts.push('Evoluir Nincada (com espaço no time + Poké Ball)')
      break
    case 'spin':
      parts.push('Girar personagem (Milcery)')
      break
    case 'tower-of-darkness':
      parts.push('Torre das Trevas')
      break
    case 'tower-of-waters':
      parts.push('Torre das Águas')
      break
    case 'three-critical-hits':
      parts.push('3 golpes críticos em uma batalha')
      break
    case 'take-damage':
      parts.push('Receber 49+ de dano e caminhar sob o portão em Dusty Bowl')
      break
    case 'agile-style-move':
      parts.push('Usar golpe em estilo Ágil 20×')
      break
    case 'strong-style-move':
      parts.push('Usar golpe em estilo Forte 20×')
      break
    case 'recoil-damage':
      parts.push('Sofrer 294+ de dano de recuo')
      break
    default:
      if (trigger) parts.push(trigger.replace(/-/g, ' '))
      else parts.push('Condição especial')
  }

  if (d.min_happiness) parts.push(`Amizade ≥${d.min_happiness}`)
  if (d.min_affection) parts.push(`Afeto ≥${d.min_affection} ♥`)
  if (d.time_of_day === 'night') parts.push('à noite')
  if (d.time_of_day === 'day') parts.push('de dia')
  if (d.gender === 1) parts.push('fêmea')
  if (d.gender === 2) parts.push('macho')
  if (d.held_item?.name && trigger !== 'trade') parts.push(`+ ${itemName(d.held_item.name)}`)
  if (d.known_move?.name) parts.push(`sabendo ${pokeName(d.known_move.name)}`)
  if (d.known_move_type?.name) parts.push(`sabendo golpe ${typeName(d.known_move_type.name)}`)
  if (d.needs_overworld_rain) parts.push('+ chuva no mapa')
  if (d.turn_upside_down) parts.push('+ virar console de cabeça pra baixo')
  if (d.party_species?.name) parts.push(`+ ${pokeName(d.party_species.name)} no time`)
  if (d.party_type?.name) parts.push(`+ Pokémon ${typeName(d.party_type.name)} no time`)
  if (d.min_beauty) parts.push(`Beleza ≥${d.min_beauty}`)
  if (d.location?.name) parts.push(`local especial (${d.location.name.replace(/-/g, ' ')})`)

  return parts.join(' · ')
}

export function getEvolutionMethodIcon(details) {
  if (!details || details.length === 0) return '❓'
  const d = details[0]
  const trigger = d?.trigger?.name

  if (trigger === 'use-item') return '🪨'
  if (trigger === 'trade') return '🔄'
  if (trigger === 'shed') return '🐚'
  if (trigger === 'spin') return '🌀'
  if (trigger === 'three-critical-hits') return '⚡'
  if (trigger === 'take-damage') return '🏺'
  if (trigger === 'tower-of-darkness') return '🌑'
  if (trigger === 'tower-of-waters') return '💧'
  if (trigger === 'agile-style-move' || trigger === 'strong-style-move') return '🎯'
  if (trigger === 'recoil-damage') return '💥'
  if (d?.turn_upside_down) return '🙃'
  if (d?.min_happiness) return '💛'
  if (d?.min_affection) return '💝'
  if (d?.time_of_day === 'night') return '🌙'
  if (d?.time_of_day === 'day') return '☀️'
  if (d?.min_level) return '⬆️'
  if (d?.held_item) return '🎒'
  if (d?.known_move_type || d?.known_move) return '📖'
  if (d?.party_type || d?.party_species) return '👥'
  return '✨'
}
