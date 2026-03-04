export const requireAIEnabled = (req, res, next) => {
    const aiEnabled = process.env.AI_ENABLED === 'true';

    if (!aiEnabled) {
        return res.status(503).json({
            success: false,
            message: 'El servicio de análisis con IA no está habilitado en este entorno.',
        });
    }

    next();
};