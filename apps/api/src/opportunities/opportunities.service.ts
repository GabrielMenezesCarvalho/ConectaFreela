import { Injectable } from '@nestjs/common';

const opportunities = [
  {
    id: 'opp-001',
    title: 'Criação de identidade visual',
    organization: 'Instituto Horizonte',
    category: 'Design',
    skills: ['Figma', 'Design gráfico'],
    description: 'Apoio na criação da identidade visual de um projeto social.',
  },
  {
    id: 'opp-002',
    title: 'Desenvolvimento de página institucional',
    organization: 'Projeto Semente',
    category: 'Tecnologia',
    skills: ['React', 'TypeScript'],
    description: 'Construção de uma página para divulgar ações comunitárias.',
  },
  {
    id: 'opp-003',
    title: 'Planejamento de campanha digital',
    organization: 'Rede Acolher',
    category: 'Comunicação',
    skills: ['Marketing digital', 'Redação'],
    description: 'Planejamento de conteúdo para uma campanha de arrecadação.',
  },
];

@Injectable()
export class OpportunitiesService {
  findAll() {
    return opportunities;
  }
}
