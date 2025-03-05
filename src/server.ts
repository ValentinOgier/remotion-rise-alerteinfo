import express, { Request, Response } from 'express';
import { bundle } from '@remotion/bundler';
import { getCompositions, renderStill, renderMedia, RenderMediaOnProgress } from '@remotion/renderer';
import path from 'path';
import fs from 'fs/promises';
import { NewsSchema } from './schema';

const app = express();
app.use(express.json());

const OUTPUT_DIR = path.join(__dirname, '../out');
const PREVIEW_DIR = path.join(__dirname, '../out/previews');

// Types pour les valeurs de la Map
type RenderProgressValue = {
  type: 'progress';
  value: number;
  estimatedTimeRemaining?: number; // en secondes
} | {
  type: 'url';
  value: string;
} | {
  type: 'error';
  value: string;
};

// Map pour stocker les progressions des rendus
const renderProgress = new Map<string, RenderProgressValue>();

// Endpoint SSE pour suivre la progression
app.get('/progress/:id', (req, res) => {
  const renderId = req.params.id;
  const progress = renderProgress.get(renderId);
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Envoyer la progression initiale
  res.write(`data: ${JSON.stringify({ progress: progress?.type === 'progress' ? progress.value : 0 })}\n\n`);

  // Fonction pour envoyer les mises à jour
  const sendProgress = () => {
    const progress = renderProgress.get(renderId);
    const progressValue = progress?.type === 'progress' ? progress.value : 0;
    res.write(`data: ${JSON.stringify({ progress: progressValue })}\n\n`);

    // Si le rendu est terminé, fermer la connexion
    if (progressValue >= 100) {
      clearInterval(interval);
      res.end();
      renderProgress.delete(renderId);
    }
  };

  // Envoyer des mises à jour toutes les 100ms
  const interval = setInterval(sendProgress, 100);

  // Nettoyer l'intervalle si le client se déconnecte
  req.on('close', () => {
    clearInterval(interval);
  });
});

// Créer les dossiers de sortie s'ils n'existent pas
(async () => {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.mkdir(PREVIEW_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating output directories:', error);
  }
})();

app.post('/render-still', async (req: Request, res: Response) => {
  try {
    const { inputProps, frame = 0 } = req.body;
    console.log('Received props for still:', JSON.stringify(inputProps, null, 2));
    
    // Générer un ID unique pour ce rendu
    const renderId = Date.now().toString();
    renderProgress.set(renderId, { type: 'progress', value: 0 });
    
    // Valider les props avec le schéma
    const validatedProps = NewsSchema.parse(inputProps);
    console.log('Validated props:', JSON.stringify(validatedProps, null, 2));
    
    // Créer le bundle
    const bundleLocation = await bundle(path.join(__dirname, './index.ts'));
    renderProgress.set(renderId, { type: 'progress', value: 20 });
    
    // Obtenir les compositions
    const compositions = await getCompositions(bundleLocation);
    console.log('Available compositions:', compositions.map(c => c.id));
    
    let composition = compositions.find((c) => c.id === 'RiseNews');
    
    if (!composition) {
      throw new Error('Composition not found');
    }

    // Créer une nouvelle composition avec les props validées
    composition = {
      ...composition,
      defaultProps: validatedProps,
      props: validatedProps,
    };

    renderProgress.set(renderId, { type: 'progress', value: 40 });
    
    // Générer un nom de fichier unique
    const outputFile = path.join(OUTPUT_DIR, `still-${Date.now()}.png`);
    
    // Rendre l'image avec les props validées
    await renderStill({
      composition,
      serveUrl: bundleLocation,
      output: outputFile,
      frame,
    });
    
    renderProgress.set(renderId, { type: 'progress', value: 100 });
    
    // Renvoyer le chemin du fichier
    res.json({
      success: true,
      file: outputFile,
      url: `/out/${path.basename(outputFile)}`,
      renderId,
    });
  } catch (error: unknown) {
    console.error('Error in render-still:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    });
  }
});

app.post('/render-video', async (req: Request, res: Response) => {
  try {
    const { inputProps } = req.body;
    console.log('Received props for video:', JSON.stringify(inputProps, null, 2));
    
    // Générer un ID unique pour ce rendu
    const renderId = Date.now().toString();
    renderProgress.set(renderId, { type: 'progress', value: 0 });
    
    // Retourner immédiatement le renderId
    res.json({
      success: true,
      renderId,
      status: 'processing'
    });

    // Continuer le traitement en arrière-plan
    (async () => {
      try {
        // Valider les props avec le schéma
        const validatedProps = NewsSchema.parse(inputProps);
        console.log('Validated props:', JSON.stringify(validatedProps, null, 2));
        
        // Créer le bundle
        const bundleLocation = await bundle(path.join(__dirname, './index.ts'));
        renderProgress.set(renderId, { type: 'progress', value: 5 });
        
        // Obtenir les compositions
        const compositions = await getCompositions(bundleLocation);
        console.log('Available compositions:', compositions.map(c => c.id));
        
        let composition = compositions.find((c) => c.id === 'RiseNews');
        
        if (!composition) {
          throw new Error('Composition not found');
        }

        // Créer une nouvelle composition avec les props validées
        composition = {
          ...composition,
          defaultProps: validatedProps,
          props: validatedProps,
        };

        renderProgress.set(renderId, { type: 'progress', value: 10 });
        
        // Générer un nom de fichier unique
        const outputFile = path.join(OUTPUT_DIR, `video-${Date.now()}.mp4`);
        
        // Rendre la vidéo avec les props validées
        await renderMedia({
          composition,
          serveUrl: bundleLocation,
          outputLocation: outputFile,
          codec: 'h264',
          onProgress: (progress: Parameters<RenderMediaOnProgress>[0]) => {
            // Calculer le temps restant estimé
            const estimatedTimeRemaining = progress.renderEstimatedTime 
              ? Math.ceil((1 - progress.progress) * progress.renderEstimatedTime)
              : undefined;

            // progress.progress est un nombre entre 0 et 1
            renderProgress.set(renderId, { 
              type: 'progress', 
              value: 10 + Math.round(progress.progress * 90),
              estimatedTimeRemaining
            });
          },
        });
        
        renderProgress.set(renderId, { type: 'progress', value: 100 });
        
        // Stocker l'URL du fichier pour la récupération ultérieure
        renderProgress.set(`${renderId}_url`, { 
          type: 'url', 
          value: `/out/${path.basename(outputFile)}` 
        });
      } catch (error: unknown) {
        console.error('Error in render-video background process:', error);
        renderProgress.set(renderId, { type: 'progress', value: -1 }); // Indique une erreur
        renderProgress.set(`${renderId}_error`, { 
          type: 'error', 
          value: error instanceof Error ? error.message : 'An unknown error occurred'
        });
      }
    })();
  } catch (error: unknown) {
    console.error('Error in render-video:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    });
  }
});

// Endpoint pour récupérer le statut et l'URL du fichier
app.get('/render-status/:id', (req, res) => {
  const renderId = req.params.id;
  const progress = renderProgress.get(renderId);
  const fileUrl = renderProgress.get(`${renderId}_url`);
  const error = renderProgress.get(`${renderId}_error`);

  if (!progress) {
    res.status(404).json({ success: false, error: 'Render job not found' });
    return;
  }

  if (error?.type === 'error') {
    res.json({
      success: false,
      error: error.value,
      status: 'error'
    });
    return;
  }

  res.json({
    success: true,
    progress: progress.type === 'progress' ? progress.value : 0,
    estimatedTimeRemaining: progress.type === 'progress' ? progress.estimatedTimeRemaining : undefined,
    status: progress.type === 'progress' && progress.value >= 100 ? 'completed' : 'processing',
    url: fileUrl?.type === 'url' ? fileUrl.value : undefined
  });
});

app.post('/preview', async (req: Request, res: Response) => {
  try {
    const { inputProps, frame = 0 } = req.body;
    console.log('Received props for preview:', JSON.stringify(inputProps, null, 2));
    
    // Générer un ID unique pour ce rendu
    const renderId = Date.now().toString();
    renderProgress.set(renderId, { type: 'progress', value: 0 });
    
    // Valider les props avec le schéma
    const validatedProps = NewsSchema.parse(inputProps);
    console.log('Validated props:', JSON.stringify(validatedProps, null, 2));
    
    // Créer le bundle
    const bundleLocation = await bundle(path.join(__dirname, './index.ts'));
    renderProgress.set(renderId, { type: 'progress', value: 20 });
    
    // Obtenir les compositions
    const compositions = await getCompositions(bundleLocation);
    console.log('Available compositions:', compositions.map(c => c.id));
    
    let composition = compositions.find((c) => c.id === 'RiseNews');
    
    if (!composition) {
      throw new Error('Composition not found');
    }

    // Créer une nouvelle composition avec les props validées
    composition = {
      ...composition,
      defaultProps: validatedProps,
      props: validatedProps,
    };

    renderProgress.set(renderId, { type: 'progress', value: 40 });
    
    // Nettoyer les anciens fichiers de preview
    try {
      const files = await fs.readdir(PREVIEW_DIR);
      await Promise.all(
        files.map(file => fs.unlink(path.join(PREVIEW_DIR, file)))
      );
    } catch (error) {
      console.error('Error cleaning preview directory:', error);
    }
    
    // Générer un nom de fichier unique
    const outputFile = path.join(PREVIEW_DIR, `preview-${Date.now()}.png`);
    
    // Rendre l'image avec les props validées
    await renderStill({
      composition,
      serveUrl: bundleLocation,
      output: outputFile,
      frame,
    });
    
    renderProgress.set(renderId, { type: 'progress', value: 100 });
    
    // Renvoyer le chemin du fichier
    res.json({
      success: true,
      file: outputFile,
      url: `/out/previews/${path.basename(outputFile)}`,
      renderId,
    });
  } catch (error: unknown) {
    console.error('Error in preview:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    });
  }
});

// Servir les fichiers statiques du dossier out
app.use('/out', express.static(OUTPUT_DIR));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Remotion API server running on port ${PORT}`);
}); 
