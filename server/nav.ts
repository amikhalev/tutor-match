import { Request } from 'express';

const nav = [
    { title: 'Home', href: '/' },
    { title: 'Test', href: '/test' },
];

function navLocals(req: Request) {
    const activeItem = nav.find((item) => req.path === item.href);
    return {
        title: activeItem ? activeItem.title : 'Page',
        nav: nav.map((item) => ({
            ...item, active: item === activeItem,
        })),
        user: req.user,
    };
}

export { nav, navLocals };