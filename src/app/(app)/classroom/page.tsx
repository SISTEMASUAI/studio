import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';

const courses = [
  { id: 'course-1', title: 'Introduction to Web Development', instructor: 'Dr. Ada Lovelace', progress: 75 },
  { id: 'course-2', title: 'Advanced Marketing Strategies', instructor: 'Prof. David Ogilvy', progress: 40 },
  { id: 'course-3', title: 'Graphic Design Fundamentals', instructor: 'Dr. Paula Scher', progress: 90 },
  { id: 'course-4', title: 'Data Science with Python', instructor: 'Prof. Guido van Rossum', progress: 25 },
];

const assignments = [
  { course: 'Web Development', title: 'Project 1: Personal Portfolio', due: '2024-09-01', status: 'Submitted' },
  { course: 'Marketing Strategies', title: 'Case Study: Ad Campaign Analysis', due: '2024-08-25', status: 'In Progress' },
  { course: 'Graphic Design', title: 'Final Project: Brand Identity', due: '2024-09-10', status: 'Not Started' },
  { course: 'Data Science', title: 'Homework 3: Data Cleaning', due: '2024-08-28', status: 'In Progress' },
];

export default function ClassroomPage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold font-headline">Virtual Classroom</h1>
        <p className="text-muted-foreground">Your personal learning space.</p>
      </section>

      <section>
        <h2 className="text-2xl font-headline font-semibold mb-4">My Courses</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => {
            const image = PlaceHolderImages.find(img => img.id === course.id);
            return (
              <Card key={course.id} className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
                {image && <Image src={image.imageUrl} alt={image.description} width={600} height={400} className="w-full h-40 object-cover" data-ai-hint={image.imageHint} />}
                <CardHeader className="flex-grow">
                  <CardTitle className="font-headline text-lg">{course.title}</CardTitle>
                  <CardDescription>{course.instructor}</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button variant="secondary" className="w-full">Continue Learning</Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-headline font-semibold mb-4">Upcoming Assignments</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{assignment.course}</TableCell>
                  <TableCell>{assignment.title}</TableCell>
                  <TableCell>{assignment.due}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={assignment.status === 'Submitted' ? 'default' : assignment.status === 'In Progress' ? 'secondary' : 'outline'}>
                        {assignment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>
    </div>
  );
}
