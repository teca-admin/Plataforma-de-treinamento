export interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  instructor: string;
  duration: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  content: string;
  video_url: string;
  order_index: number;
}

export interface UserProgress {
  lesson_id: number;
  completed: number;
}
