export interface ResumeProfile {
  name: string;
  email: string;
  phone: string;
  url: string;
  summary: string;
  location: string;
}

export interface ResumeWorkExperience {
  company: string;
  jobTitle: string;
  date: string;
  descriptions: string[];
  // Optional, structured date fields for better integration with consumers
  month?: string;
  year?: string;
  endMonth?: string;
  endYear?: string;
  currentlyWorking?: boolean;
}

export interface ResumeEducation {
  school: string;
  degree: string;
  date: string;
  gpa: string;
  descriptions: string[];
  // Optional, structured date fields for better integration with consumers
  month?: string;
  year?: string;
  endMonth?: string;
  endYear?: string;
  currentlyPursuing?: boolean;
}

export interface ResumeProject {
  project: string;
  date: string;
  descriptions: string[];
}

export interface FeaturedSkill {
  skill: string;
  rating: number;
}

export interface ResumeSkills {
  featuredSkills: FeaturedSkill[];
  descriptions: string[];
}

export interface ResumeCustom {
  descriptions: string[];
}

export interface Resume {
  profile: ResumeProfile;
  workExperiences: ResumeWorkExperience[];
  educations: ResumeEducation[];
  projects: ResumeProject[];
  skills: ResumeSkills;
  custom: ResumeCustom;
}

export type ResumeKey = keyof Resume;
