export interface UserJSON {
    id: number;
    googleId: string | null;
    displayName: string;
    biography: string | null;
    role: number;
}

export interface TutorSessionJSON {
    id: number;
    startTime: number;
    durationSeconds: number;
    tutor: UserJSON | null;
    school: string | null;
    location: string | null;
    subject: string | null;
    maxStudents: number;
    students: UserJSON[];
    cancelledAt: number | null;
}
