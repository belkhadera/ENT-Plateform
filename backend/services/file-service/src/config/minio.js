const Minio = require('minio');

// Configuration du client MinIO
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123'
});

// Fonction d'initialisation du bucket
async function initBucket() {
  const bucketName = process.env.MINIO_BUCKET || 'est-files';
  
  try {
    console.log(`🔍 Vérification du bucket ${bucketName}...`);
    const exists = await minioClient.bucketExists(bucketName);
    
    if (!exists) {
      console.log(`📦 Création du bucket ${bucketName}...`);
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`✅ Bucket ${bucketName} créé`);
      
      // Politique de lecture publique
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/*`]
          }
        ]
      };
      
      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
      console.log(`✅ Politique du bucket configurée`);
    } else {
      console.log(`✅ Bucket ${bucketName} existe déjà`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur MinIO:', error);
    throw error;
  }
}

// Exporter à la fois le client et la fonction d'init
module.exports = {
  minioClient,
  initBucket
};