import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  disk: process.env.FILESYSTEM_DISK || 'local', // local | s3 | minio | gcs
  localUploadDir: './uploads',
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
    bucket: process.env.AWS_BUCKET,
    usePathStyle: process.env.AWS_USE_PATH_STYLE_ENDPOINT === 'true',
  },
}));
