import { Router } from 'express';
import { navLocals } from './nav';

const router = Router();

router.get('/', (req, res) => {
    console.log("user: ", req.user && req.user.displayName);
    res.render('index', { ...navLocals(req), message: 'Hello there!' });
})

router.get('/test', (req, res) => {
    res.render('index', { ...navLocals(req), message: 'Hello there 2!' });
})

export default router;
