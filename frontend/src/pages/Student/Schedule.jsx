import LessonCard from 'components/Student/LessonCard';
import { mockLessons } from 'mocks/lessons';

const Schedule = () => {
  return (
    <div className="schedule-page">
      <h2>Your Schedule</h2>
      {mockLessons.map((lesson) => (
        <LessonCard 
          key={lesson.id} 
          lesson={lesson} 
          showCancelButton={true} 
        />
      ))}
    </div>
  );
};