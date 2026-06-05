import type { Profile, Blog, Project, Publication, Experience } from '@/types'

export const MOCK_PROFILE: Profile = {
  id: 1,
  name: 'Shashwat Sarkar',
  title: 'ML Engineer & Researcher',
  resume_file_url: 'https://example.com/cv.pdf',
  about: `I'm a machine learning researcher and engineer focused on computer vision,
deep learning systems, and scalable MLOps infrastructure.

Currently working on pushing the boundaries of vision models and deploying
them at scale. I enjoy the full stack — from architecture design to
productionising models in containerised environments.`,
  typing_animation_texts: JSON.stringify([
    'Deep Learning Researcher',
    'Computer Vision Engineer',
    'MLOps Architect',
    'Open Source Builder',
  ]),
  oneliner_config: JSON.stringify({
    text: 'Building intelligent systems at the intersection of deep learning, computer vision, and scalable infrastructure',
    highlights: [
      { word: 'deep learning', color: '#D97757' },
      { word: 'computer vision', color: '#D97757' },
      { word: 'scalable infrastructure', color: '#D97757' },
    ],
  }),
  socials: JSON.stringify([
    { platform: 'github', url: 'https://github.com/shshwtsrkr' },
    { platform: 'googlescholar', url: 'https://scholar.google.com' },
    { platform: 'linkedin', url: 'https://linkedin.com' },
    { platform: 'x', url: 'https://x.com' },
    { platform: 'email', url: 'papershared8@gmail.com' },
  ]),
  tech_stack: JSON.stringify([
    { icon: 'SiPython', name: 'Python', color: '#3776AB' },
    { icon: 'SiPytorch', name: 'PyTorch', color: '#EE4C2C' },
    { icon: 'SiTensorflow', name: 'TensorFlow', color: '#FF6F00' },
    { icon: 'SiOpencv', name: 'OpenCV', color: '#5C3EE8' },
    { icon: 'SiDocker', name: 'Docker', color: '#2496ED' },
    { icon: 'SiKubernetes', name: 'Kubernetes', color: '#326CE5' },
    { icon: 'FaAws', name: 'AWS', color: '#FF9900' },
    { icon: 'FaJava', name: 'Java', color: '#007396' },
    { icon: 'SiFlask', name: 'Flask', color: '#FFFFFF' },
    { icon: 'SiDjango', name: 'Django', color: '#092E20' },
    { icon: 'SiGnubash', name: 'Shell', color: '#4EAA25' },
    { icon: 'FaLinux', name: 'Linux', color: '#FCC624' },
    { icon: 'SiGit', name: 'Git', color: '#F05032' },
    { icon: 'SiCloudflare', name: 'Cloudflare', color: '#F38020' },
    { icon: 'SiReact', name: 'React', color: '#61DAFB' },
    { icon: 'SiNextdotjs', name: 'Next.js', color: '#FFFFFF' },
    { icon: 'SiPostgresql', name: 'PostgreSQL', color: '#336791' },
    { icon: 'SiNumpy', name: 'NumPy', color: '#013243' },
    { icon: 'FaWindows', name: 'Windows', color: '#0078D6' },
  ]),
  expertise_cards: JSON.stringify([
    { title: 'Deep Learning Research', description: 'Neural architectures, model optimization, and cutting-edge ML research', icon: '🧠' },
    { title: 'Computer Vision', description: 'Object detection, image segmentation, and visual understanding systems', icon: '👁️' },
    { title: 'DevOps & MLOps', description: 'Scalable ML pipelines, containerization, and production deployment', icon: '⚙️' },
  ]),
  name_animation_speed: 2.5,
}

export const MOCK_BLOGS: Blog[] = [
  {
    id: 1,
    title: 'Sample Blog Post',
    description: 'This is placeholder blog content. Add your real blogs via the admin dashboard after connecting Supabase.',
    date: new Date().toISOString().split('T')[0],
    tag: 'ML',
    tag_color: '#9333ea',
    read_duration: 5,
    is_published: true,
    display_order: 1,
  },
]

export const MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    title: 'Sample Project',
    description: 'Placeholder project. Add your real projects via the admin dashboard after connecting Supabase.',
    technologies: 'Python, PyTorch, Docker',
    status: 'Completed',
    is_published: true,
    display_order: 1,
    show_code_button: true,
    show_live_demo_button: false,
  },
]

export const MOCK_PUBLICATIONS: Publication[] = [
  {
    id: 1,
    title: 'Sample Publication',
    authors: 'Sarkar, S. et al.',
    venue: 'Conference / Journal',
    publication_year: 2024,
    abstract_text: 'Placeholder publication. Add your real publications via the admin dashboard after connecting Supabase.',
    status: 'Accepted',
    is_published: true,
    display_order: 1,
    show_pdf_button: true,
    show_doi_button: false,
  },
]

export const MOCK_EXPERIENCES: Experience[] = [
  {
    id: 1, role: 'ML Research Engineer', company: 'Current Company',
    start_date: '2024-06-01', end_date: null, is_current: true,
    description: '- Building scalable vision model training infrastructure\n- Designing attention mechanisms for medical imaging\n- Reduced inference latency by 40% via quantisation',
    display_order: 1,
  },
  {
    id: 2, role: 'Computer Vision Intern', company: 'Previous Company',
    start_date: '2023-08-01', end_date: '2024-05-31', is_current: false,
    description: '- Implemented real-time object detection using YOLOv8\n- Deployed model serving API handling 10k req/day',
    display_order: 2,
  },
  {
    id: 3, role: 'Research Assistant', company: 'University',
    start_date: '2022-09-01', end_date: '2023-07-31', is_current: false,
    description: '- Reproduced results from CVPR 2022 papers\n- Built evaluation harness for segmentation benchmarks',
    display_order: 3,
  },
]

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return url.length > 0 && !url.includes('placeholder') && url.includes('.supabase.')
}
