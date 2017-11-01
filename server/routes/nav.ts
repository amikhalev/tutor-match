import { Request } from 'express';

export const home = { title: 'Home', href: '/' };
export const tutorSessions = { title: 'Tutor Sessions', href: '/tutor-sessions' };
export const nav = [ home, tutorSessions ];

export function locals(req: Request) {
    const activeItem = nav.find(item => req.path === item.href);
    return {
        title: activeItem ? activeItem.title : 'Page',
        nav: nav.map(item => ({
            ...item, active: item === activeItem,
        })),
        user: req.user,
    };
}
