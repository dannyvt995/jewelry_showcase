/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode:false,
    webpack: (config) => {
        config.module.rules.push({
          test: /\.glsl$/, // Áp dụng raw-loader cho các file .glsl
          use: 'raw-loader',
        });
        return config;
      },
};

export default nextConfig;
