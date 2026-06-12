export type ProjectCategory =
  | 'Luxury Villas'
  | 'Apartments'
  | 'Commercial'
  | 'Drone Shoots'
  | 'Marketing Campaigns'

export interface Project {
  id: string
  title: string
  city: string
  location: string
  category: ProjectCategory
  description: string
  client: string
  services: string[]
  thumbnail: string
  videoUrl: string
  images: string[]
  featured?: boolean
  year: string
}

export const projects: Project[] = [
  {
    id: 'azure-heights',
    title: 'Azure Heights',
    city: 'Goa',
    location: 'Goa, India',
    category: 'Luxury Villas',
    description:
      'A cinematic brand film capturing coastal luxury living — golden hour aerials, intimate interior narratives, and a narrative arc designed for high-net-worth buyers.',
    client: 'Azure Developers Pvt. Ltd.',
    services: ['Property Marketing Video', 'Drone Cinematography', 'Brand Storytelling'],
    thumbnail: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80',
    videoUrl: 'https://videos.pexels.com/video-files/3209828/3209828-uhd_2560_1440_25fps.mp4',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
    ],
    featured: true,
    year: '2025',
  },
  {
    id: 'meridian-tower',
    title: 'Meridian Tower',
    city: 'Mumbai',
    location: 'Mumbai, India',
    category: 'Apartments',
    description:
      'A vertical lifestyle story for a premium residential tower — lobby-to-penthouse journey with precision lighting and architectural emphasis.',
    client: 'Meridian Realty Group',
    services: ['Property Marketing Video', 'Real Estate Photography', 'Social Media Content'],
    thumbnail: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
    videoUrl: 'https://videos.pexels.com/video-files/7578552/7578552-uhd_2560_1440_25fps.mp4',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
    ],
    featured: true,
    year: '2025',
  },
  {
    id: 'obsidian-plaza',
    title: 'Obsidian Plaza',
    city: 'Bangalore',
    location: 'Bangalore, India',
    category: 'Commercial',
    description:
      'Corporate-grade visual identity for a Grade-A commercial development — emphasizing scale, connectivity, and investment potential.',
    client: 'Obsidian Infrastructure',
    services: ['Promotional Campaign', 'Drone Cinematography', 'Brand Storytelling'],
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
    videoUrl: 'https://videos.pexels.com/video-files/3254035/3254035-uhd_2560_1440_25fps.mp4',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
    ],
    featured: true,
    year: '2024',
  },
  {
    id: 'skyline-aerial',
    title: 'Skyline Aerial Series',
    city: 'Hyderabad',
    location: 'Hyderabad, India',
    category: 'Drone Shoots',
    description:
      'Sweeping FPV and cinematic drone sequences across a 200-acre township — revealing master planning from perspectives impossible on ground.',
    client: 'Skyline Urban Projects',
    services: ['Drone Cinematography', 'Property Marketing Video'],
    thumbnail: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80',
    videoUrl: 'https://videos.pexels.com/video-files/2795405/2795405-uhd_2560_1440_25fps.mp4',
    images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80',
    ],
    featured: true,
    year: '2024',
  },
  {
    id: 'verde-estates',
    title: 'Verde Estates',
    city: 'Pune',
    location: 'Pune, India',
    category: 'Luxury Villas',
    description:
      'An editorial approach to villa marketing — slow, deliberate camera movement through landscaped gardens and bespoke interiors.',
    client: 'Verde Living',
    services: ['Property Marketing Video', 'Real Estate Photography'],
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    videoUrl: 'https://videos.pexels.com/video-files/3209828/3209828-uhd_2560_1440_25fps.mp4',
    images: [
      'https://images.unsplash.com/photo-1605276374102-debf2b831fa2?w=1200&q=80',
    ],
    featured: true,
    year: '2024',
  },
  {
    id: 'launch-campaign',
    title: 'Horizon Launch Campaign',
    city: 'Delhi NCR',
    location: 'Delhi NCR, India',
    category: 'Marketing Campaigns',
    description:
      'Multi-format launch campaign spanning hero films, social cutdowns, and investor decks — unified under a single visual language.',
    client: 'Horizon Properties',
    services: ['Promotional Campaign', 'Social Media Content', 'Brand Storytelling'],
    thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
    videoUrl: 'https://videos.pexels.com/video-files/7578552/7578552-uhd_2560_1440_25fps.mp4',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c2d32e?w=1200&q=80',
    ],
    featured: true,
    year: '2023',
  },
  {
    id: 'crown-residences',
    title: 'Crown Residences',
    city: 'Chennai',
    location: 'Chennai, India',
    category: 'Apartments',
    description:
      'Refined apartment showcase with emphasis on lifestyle amenities — pool, clubhouse, and panoramic city views.',
    client: 'Crown Developers',
    services: ['Property Marketing Video', 'Real Estate Photography', 'Social Media Content'],
    thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
    videoUrl: 'https://videos.pexels.com/video-files/3254035/3254035-uhd_2560_1440_25fps.mp4',
    images: [
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=80',
    ],
    featured: true,
    year: '2023',
  },
  {
    id: 'terra-drone',
    title: 'Terra Vista Drone Film',
    city: 'Jaipur',
    location: 'Jaipur, India',
    category: 'Drone Shoots',
    description:
      'Desert-edge luxury development captured through golden-hour aerial cinematography and precision orbit shots.',
    client: 'Terra Vista Group',
    services: ['Drone Cinematography', 'Property Marketing Video'],
    thumbnail: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1200&q=80',
    videoUrl: 'https://videos.pexels.com/video-files/2795405/2795405-uhd_2560_1440_25fps.mp4',
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80',
    ],
    featured: true,
    year: '2023',
  },
  {
    id: 'palm-grove',
    title: 'Palm Grove Villas',
    city: 'Kochi',
    location: 'Kochi, India',
    category: 'Luxury Villas',
    description:
      'Backwater-edge villa community filmed through misty dawn sequences and warm interior walkthroughs for NRI buyers.',
    client: 'Palm Grove Developers',
    services: ['Property Marketing Video', 'Drone Cinematography'],
    thumbnail: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=80',
    videoUrl: 'https://videos.pexels.com/video-files/3209828/3209828-uhd_2560_1440_25fps.mp4',
    images: [
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&q=80',
    ],
    featured: true,
    year: '2024',
  },
  {
    id: 'lakefront-pune',
    title: 'Lakefront Residences',
    city: 'Pune',
    location: 'Pune, India',
    category: 'Apartments',
    description:
      'Waterfront apartment launch film blending lifestyle amenities with lake-view aerial establishing shots.',
    client: 'Lakefront Homes',
    services: ['Property Marketing Video', 'Social Media Content'],
    thumbnail: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200&q=80',
    videoUrl: 'https://videos.pexels.com/video-files/7578552/7578552-uhd_2560_1440_25fps.mp4',
    images: [
      'https://images.unsplash.com/photo-1600210492493-3ca856a3d2f3?w=1200&q=80',
    ],
    featured: true,
    year: '2025',
  },
  {
    id: 'zenith-mumbai',
    title: 'Zenith Business Park',
    city: 'Mumbai',
    location: 'Mumbai, India',
    category: 'Commercial',
    description:
      'High-rise commercial park showcase highlighting connectivity, scale, and premium tenant-ready spaces for investors.',
    client: 'Zenith Corp Parks',
    services: ['Promotional Campaign', 'Drone Cinematography'],
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
    videoUrl: 'https://videos.pexels.com/video-files/3254035/3254035-uhd_2560_1440_25fps.mp4',
    images: [
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80',
    ],
    featured: true,
    year: '2025',
  },
  {
    id: 'ahmedabad-hub',
    title: 'Riverfront Hub',
    city: 'Ahmedabad',
    location: 'Ahmedabad, India',
    category: 'Commercial',
    description:
      'Mixed-use riverfront development captured through dynamic day-to-night timelapse and investor-focused narrative.',
    client: 'Sabarmati Developers',
    services: ['Brand Storytelling', 'Property Marketing Video'],
    thumbnail: 'https://images.unsplash.com/photo-1448630360778-373edd2f7b2?w=1200&q=80',
    videoUrl: 'https://videos.pexels.com/video-files/2795405/2795405-uhd_2560_1440_25fps.mp4',
    images: [
      'https://images.unsplash.com/photo-1600585154363-67a9b0a5fe73?w=1200&q=80',
    ],
    year: '2024',
  },
  {
    id: 'kolkata-heritage',
    title: 'Heritage Residences',
    city: 'Kolkata',
    location: 'Kolkata, India',
    category: 'Apartments',
    description:
      'Heritage-inspired residential tower with classical architectural details and warm, inviting interior sequences.',
    client: 'Heritage Buildcon',
    services: ['Real Estate Photography', 'Property Marketing Video'],
    thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
    videoUrl: 'https://videos.pexels.com/video-files/3209828/3209828-uhd_2560_1440_25fps.mp4',
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=80',
    ],
    year: '2023',
  },
]

export const carouselProjects = projects.filter((p) => p.featured)

export const cities = [
  ...new Set(projects.map((p) => p.city)),
].sort() as string[]

export const categories: ProjectCategory[] = [
  'Luxury Villas',
  'Apartments',
  'Commercial',
  'Drone Shoots',
  'Marketing Campaigns',
]
