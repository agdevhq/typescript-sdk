import * as esbuild from 'esbuild';
import { buildConfig } from '@ag/esbuild-config';

await esbuild.build(buildConfig());
