-- Profile data (1 entry for Home page)
INSERT IGNORE INTO profile (name, title, about, profile_image_url, github_url, linkedin_url, twitter_url, email_url) VALUES
('Dr. Alex Johnson', 
 'Machine Learning Researcher & Software Engineer',
 'I am a passionate researcher and engineer specializing in machine learning, deep learning, and computer vision. With over 8 years of experience in both academia and industry, I focus on developing practical AI solutions that make a real-world impact.

My research interests include neural architecture search, efficient deep learning, and AI for healthcare. I have published papers in top-tier conferences such as NeurIPS, CVPR, and ICCV.

When I''m not coding or researching, I enjoy contributing to open-source projects, writing technical blogs, and mentoring aspiring data scientists.',
 'https://i.pravatar.cc/300?img=12',
 'https://github.com',
 'https://linkedin.com',
 'https://twitter.com',
 'alex.johnson@example.com');

-- Blog entries (2 entries)
INSERT IGNORE INTO blogs (title, description, content, date, thumbnail_url, external_url) VALUES
('Understanding Transformer Architecture: A Deep Dive',
 'An in-depth exploration of the transformer architecture that revolutionized natural language processing and beyond. We cover attention mechanisms, positional encoding, and practical implementation tips.',
 'Full blog content here...',
 '2024-09-15',
 'https://via.placeholder.com/400x250/667eea/ffffff?text=Transformers',
 'https://medium.com/@alexjohnson/transformers-deep-dive'),

('Building Scalable ML Pipelines with Kubernetes',
 'Learn how to deploy and scale machine learning models in production using Kubernetes. This guide covers containerization, orchestration, and best practices for MLOps.',
 'Full blog content here...',
 '2024-08-22',
 'https://via.placeholder.com/400x250/764ba2/ffffff?text=ML+Pipelines',
 'https://medium.com/@alexjohnson/ml-kubernetes');

-- Project entries (2 entries)
INSERT IGNORE INTO projects (title, description, technologies, github_url, live_url, preview_image_url, status, completed_date) VALUES
('Neural Style Transfer App',
 'A web application that applies artistic styles to photographs using deep learning. Built with PyTorch and deployed as a REST API, it allows users to transform their images in real-time with various artistic filters.',
 'PyTorch, FastAPI, React, Docker, AWS',
 'https://github.com/username/neural-style-transfer',
 'https://neural-style-demo.com',
 'https://via.placeholder.com/800x450/f093fb/000000?text=Neural+Style+Transfer',
 'Completed',
 '2024-12-10'),

('Real-time Object Detection System',
 'An end-to-end object detection system using YOLO v8 for real-time video analysis. Includes a custom-trained model for detecting specific objects with 95% accuracy and a responsive dashboard for monitoring.',
 'Python, YOLO, OpenCV, Flask, TensorFlow, MongoDB',
 'https://github.com/username/realtime-detection',
 'https://object-detection-demo.com',
 'https://via.placeholder.com/800x450/4facfe/000000?text=Object+Detection',
 'Completed',
 '2024-10-15');

-- Publication entries (2 entries)
INSERT IGNORE INTO publications (title, authors, venue, publication_year, abstract_text, doi, pdf_url, thumbnail_url, code_url, status) VALUES
('EfficientNet-V2: Smaller Models and Faster Training',
 'Johnson, A., Smith, B., Chen, L.',
 'International Conference on Machine Learning (ICML)',
 2024,
 'We introduce EfficientNet-V2, a new family of convolutional networks that achieve state-of-the-art accuracy on ImageNet while being up to 6.8x faster in training. Our approach combines neural architecture search with progressive learning to find models that are both parameter-efficient and fast to train. We demonstrate that EfficientNet-V2 models transfer well to other datasets and achieve competitive performance on CIFAR-10, CIFAR-100, and other benchmarks.',
 '10.1145/icml.2024.12345',
 'https://arxiv.org/pdf/sample1.pdf',
 'https://via.placeholder.com/400x300/00d2ff/000000?text=EfficientNet-V2',
 'https://github.com/username/efficientnet-v2',
 'Accepted'),

('Attention-Based Medical Image Segmentation for COVID-19 Detection',
 'Johnson, A., Martinez, R., Wong, K., Patel, S.',
 'IEEE Conference on Computer Vision and Pattern Recognition (CVPR)',
 2023,
 'We propose a novel attention-based deep learning architecture for automated segmentation of COVID-19 lesions in CT scans. Our model achieves 96.3% dice score on the COVID-19 CT segmentation dataset, outperforming existing methods by 4.2%. We introduce a dual-attention mechanism that captures both spatial and channel-wise dependencies, enabling more accurate localization of infection regions. Clinical validation shows our method can assist radiologists in faster and more accurate diagnosis.',
 '10.1109/cvpr.2023.67890',
 'https://arxiv.org/pdf/sample2.pdf',
 'https://via.placeholder.com/400x300/f093fb/000000?text=Medical+AI',
 'https://github.com/username/medical-segmentation',
 'Under Review');
