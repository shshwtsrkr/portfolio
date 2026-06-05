export interface Profile {
  id: number
  name: string
  title: string
  about: string
  profile_image_url?: string
  ascii_image_url?: string
  github_url?: string
  linkedin_url?: string
  twitter_url?: string
  email_url?: string
  resume_file_url?: string
  typing_animation_texts?: string | string[]
  oneliner_config?: string | OnelinerConfig
  socials?: string | SocialLink[]
  tech_stack?: string | TechStackItem[]
  expertise_cards?: string | ExpertiseCard[]
  name_animation_speed?: number
  empty_messages?: string | EmptyMessages
  section_labels?: string | SectionLabels
  created_at?: string
  updated_at?: string
}

export interface EmptyMessages {
  blogs?: string
  projects?: string
  publications?: string
}

export interface SectionLabels {
  experience?: string
  publications?: string
  projects?: string
  blogs?: string
}

export interface OnelinerConfig {
  text: string
  highlights: Array<{ word: string; color: string }>
}

export interface SocialLink {
  platform: string
  url: string
  icon?: string
  color?: string
}

export interface TechStackItem {
  icon: string
  name: string
  color?: string
}

export interface ExpertiseCard {
  title: string
  description: string
  icon: string
}

export interface Blog {
  id: number
  title: string
  description?: string
  content?: string
  date: string
  thumbnail_url?: string
  external_url?: string
  tag?: string
  tag_color?: string
  read_duration?: number
  display_order?: number
  is_published?: boolean
  created_at?: string
  updated_at?: string
}

export interface Project {
  id: number
  title: string
  description?: string
  technologies?: string
  github_url?: string
  live_url?: string
  preview_image_url?: string
  status: string
  completed_date?: string
  display_order?: number
  is_published?: boolean
  show_code_button?: boolean
  show_live_demo_button?: boolean
  created_at?: string
  updated_at?: string
}

export interface Publication {
  id: number
  title: string
  authors?: string
  venue?: string
  publication_year?: number
  abstract_text?: string
  doi?: string
  pdf_url?: string
  thumbnail_url?: string
  code_url?: string
  status?: string
  show_citations?: boolean
  citation_count?: number
  display_order?: number
  is_published?: boolean
  show_pdf_button?: boolean
  show_code_button?: boolean
  show_doi_button?: boolean
  created_at?: string
  updated_at?: string
}

export interface Experience {
  id: number
  role: string
  company: string
  start_date: string
  end_date?: string | null
  is_current?: boolean
  description?: string | null
  display_order?: number
  is_published?: boolean
  created_at?: string
  updated_at?: string
}

export interface NavbarConfig {
  id: number
  section_name: string
  display_order: number
  is_visible: boolean
}
