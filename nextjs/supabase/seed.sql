-- Seed data for portfolio — run in Supabase SQL Editor
-- Clears existing data first, then inserts samples

TRUNCATE profile, blogs, projects, publications RESTART IDENTITY CASCADE;

-- ── PROFILE ──────────────────────────────────────────────────────────────────
INSERT INTO profile (
  name, title, about,
  typing_animation_texts, oneliner_config, socials, tech_stack, expertise_cards,
  name_animation_speed
) VALUES (
  'Shashwat Sarkar',
  'ML Engineer & Researcher',
  'I research and build at the intersection of deep learning, computer vision, and production ML systems.

Currently focused on scalable vision architectures and MLOps infrastructure — making models that work in the lab actually work in the real world.

Previously: [your previous role]. Based in [your location].',

  '["Deep Learning Researcher", "Computer Vision Engineer", "MLOps Architect", "Open Source Builder"]',

  '{"text": "Building intelligent systems at the intersection of deep learning, computer vision, and scalable infrastructure", "highlights": [{"word": "deep learning", "color": "#D97757"}, {"word": "computer vision", "color": "#D97757"}, {"word": "scalable infrastructure", "color": "#D97757"}]}',

  '[{"platform": "github", "url": "https://github.com/shshwtsrkr"}, {"platform": "googlescholar", "url": "https://scholar.google.com"}, {"platform": "linkedin", "url": "https://linkedin.com/in/yourprofile"}, {"platform": "x", "url": "https://x.com"}, {"platform": "email", "url": "papershared8@gmail.com"}]',

  '[{"icon": "SiPython", "name": "Python", "color": "#3776AB"}, {"icon": "SiPytorch", "name": "PyTorch", "color": "#EE4C2C"}, {"icon": "SiTensorflow", "name": "TensorFlow", "color": "#FF6F00"}, {"icon": "SiOpencv", "name": "OpenCV", "color": "#5C3EE8"}, {"icon": "SiDocker", "name": "Docker", "color": "#2496ED"}, {"icon": "SiKubernetes", "name": "Kubernetes", "color": "#326CE5"}, {"icon": "FaAws", "name": "AWS", "color": "#FF9900"}, {"icon": "FaJava", "name": "Java", "color": "#007396"}, {"icon": "SiFlask", "name": "Flask", "color": "#FFFFFF"}, {"icon": "SiGnubash", "name": "Shell", "color": "#4EAA25"}, {"icon": "FaLinux", "name": "Linux", "color": "#FCC624"}, {"icon": "SiGit", "name": "Git", "color": "#F05032"}, {"icon": "SiCloudflare", "name": "Cloudflare", "color": "#F38020"}, {"icon": "SiReact", "name": "React", "color": "#61DAFB"}, {"icon": "SiNextdotjs", "name": "Next.js", "color": "#FFFFFF"}, {"icon": "SiPostgresql", "name": "PostgreSQL", "color": "#336791"}, {"icon": "SiNumpy", "name": "NumPy", "color": "#4DABCF"}, {"icon": "SiDjango", "name": "Django", "color": "#092E20"}, {"icon": "FaWindows", "name": "Windows", "color": "#0078D6"}]',

  '[{"title": "Deep Learning Research", "description": "Neural architectures, model optimization, cutting-edge ML research", "icon": "01"}, {"title": "Computer Vision", "description": "Object detection, image segmentation, visual understanding systems", "icon": "02"}, {"title": "DevOps & MLOps", "description": "Scalable ML pipelines, containerization, production deployment", "icon": "03"}]',

  2.5
);

-- ── BLOGS ─────────────────────────────────────────────────────────────────────
INSERT INTO blogs (title, description, date, tag, tag_color, read_duration, external_url, display_order, is_published) VALUES
(
  'Transformer Architecture: Attention Is All You Need — Revisited',
  'A deep dive into why attention mechanisms replaced recurrence, and what that means for modern vision-language models.',
  '2024-11-20', 'Deep Learning', '#D97757', 8,
  'https://medium.com', 1, true
),
(
  'Building a Production ML Pipeline with Kubernetes and Argo',
  'How I containerised a multi-stage CV inference pipeline and orchestrated it on bare-metal K8s. Lessons from failure.',
  '2024-09-05', 'MLOps', '#D97757', 12,
  'https://medium.com', 2, true
),
(
  'YOLO vs DETR: A Practical Comparison for Real-Time Detection',
  'Benchmarking two fundamentally different object detection paradigms on the same edge hardware.',
  '2024-07-14', 'Computer Vision', '#D97757', 6,
  'https://medium.com', 3, true
),
(
  'Why Your ML Model Works in Jupyter but Fails in Production',
  'The hidden gap between notebook experiments and deployment — data drift, latency, and all the things nobody tells you.',
  '2024-05-28', 'MLOps', '#D97757', 7,
  'https://medium.com', 4, true
);

-- ── PROJECTS ──────────────────────────────────────────────────────────────────
INSERT INTO projects (title, description, technologies, github_url, live_url, status, completed_date, display_order, is_published, show_code_button, show_live_demo_button) VALUES
(
  'Real-Time Object Detection System',
  'End-to-end YOLO v8 detection pipeline with custom-trained model (95% mAP) and a live monitoring dashboard. Deployed on edge hardware via Docker with <30ms inference latency.',
  'Python, YOLOv8, OpenCV, Flask, Docker, MongoDB',
  'https://github.com/shshwtsrkr', null,
  'Completed', 'Dec 2024', 1, true, true, false
),
(
  'Scalable MLOps Platform',
  'Custom ML training and serving infrastructure built on Kubernetes, Argo Workflows, and MLflow. Handles distributed training jobs and auto-scales inference endpoints.',
  'Python, Kubernetes, Argo, MLflow, FastAPI, PostgreSQL',
  'https://github.com/shshwtsrkr', null,
  'Active Development', null, 2, true, true, false
),
(
  'Medical Image Segmentation Framework',
  'Attention-based segmentation architecture for CT/MRI scans. Achieves 96.3% Dice score on COVID-19 lesion dataset, outperforming baseline U-Net by 4.2%.',
  'Python, PyTorch, MONAI, nibabel, NumPy',
  'https://github.com/shshwtsrkr', null,
  'Completed', 'Oct 2023', 3, true, true, false
),
(
  'Distributed Training Framework',
  'Lightweight wrapper around PyTorch DDP for multi-GPU/multi-node training. Handles gradient checkpointing, mixed precision, and experiment tracking automatically.',
  'Python, PyTorch, NCCL, Ray, Weights & Biases',
  'https://github.com/shshwtsrkr', null,
  'Completed', 'Mar 2024', 4, true, true, false
);

-- ── PUBLICATIONS ──────────────────────────────────────────────────────────────
INSERT INTO publications (title, authors, venue, publication_year, abstract_text, doi, pdf_url, code_url, status, show_citations, citation_count, display_order, is_published, show_pdf_button, show_code_button, show_doi_button) VALUES
(
  'Attention-Based Medical Image Segmentation for COVID-19 Detection',
  'Sarkar, S., Martinez, R., Wong, K., Patel, S.',
  'IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)',
  2024,
  'We propose a novel dual-attention architecture for automated segmentation of COVID-19 lesions in CT scans. Our model achieves 96.3% Dice score on the COVID-19-CT dataset, outperforming existing methods by 4.2%. The dual-attention mechanism captures both spatial and channel-wise dependencies, enabling accurate localisation of infection regions.',
  '10.1109/cvpr.2024.00001',
  'https://arxiv.org/pdf/placeholder.pdf',
  'https://github.com/shshwtsrkr',
  'Accepted', true, 12, 1, true, true, true, true
),
(
  'Efficient Knowledge Distillation for Edge Vision Models',
  'Sarkar, S., Chen, L.',
  'International Conference on Machine Learning (ICML)',
  2024,
  'We introduce a feature-alignment distillation scheme that transfers structured spatial knowledge from large vision transformers to compact CNNs. On ImageNet, our student models match ViT-B performance with 6× fewer parameters and 4× faster inference on edge hardware.',
  '10.48550/arXiv.2024.placeholder',
  'https://arxiv.org/pdf/placeholder.pdf',
  'https://github.com/shshwtsrkr',
  'Under Review', false, 0, 2, true, true, true, false
),
(
  'Robust Object Detection Under Distribution Shift',
  'Sarkar, S., Kim, J., Zhao, W.',
  'European Conference on Computer Vision (ECCV)',
  2023,
  'We study how domain gap affects detection models at inference time and propose a test-time adaptation strategy using statistics from unlabelled target batches. Our method improves mAP by 8.3% on cross-domain benchmarks without retraining.',
  '10.1007/eccv.2023.placeholder',
  'https://arxiv.org/pdf/placeholder.pdf',
  'https://github.com/shshwtsrkr',
  'Accepted', true, 7, 3, true, true, true, true
),
(
  'Self-Supervised Pretraining for Low-Data Medical Imaging',
  'Sarkar, S., Patel, S., Gupta, A.',
  'Medical Image Computing and Computer Assisted Intervention (MICCAI)',
  2023,
  'We adapt masked image modelling for medical imaging pretraining where labelled data is scarce. Using 3D volumetric masking strategies, our pretrained encoder outperforms ImageNet-pretrained baselines on 6 out of 7 downstream medical segmentation tasks.',
  null, null, 'https://github.com/shshwtsrkr',
  'Submitted', false, 0, 4, true, false, false, false
);
