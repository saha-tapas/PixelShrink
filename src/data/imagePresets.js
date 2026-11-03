export const PRESET_CATEGORIES = [
  { id: 'social-media', name: 'Social Media', description: 'Commonly used social publishing dimensions.' },
  { id: 'website-seo', name: 'Website & SEO', description: 'Practical dimensions for websites, content, and search previews.' },
  { id: 'video-platforms', name: 'Video Platforms', description: 'Common artwork dimensions for video platform channels and thumbnails.' },
  { id: 'e-commerce', name: 'E-commerce', description: 'Useful product and storefront image dimensions.' },
  { id: 'profile-cover', name: 'Profile & Cover', description: 'Common profile and cover image proportions.' },
  { id: 'device-screen', name: 'Device & Screen', description: 'Wallpaper dimensions for common displays and devices.' },
  { id: 'image-quality', name: 'Image Quality', description: 'Output format and quality combinations for different file-size goals.' },
  { id: 'custom-presets', name: 'Custom Presets', description: 'A reserved category for user-created presets.' },
];

const dimensionPreset = (id, categoryId, name, description, width, height, tags) => ({
  id,
  categoryId,
  description,
  height,
  kind: 'dimension',
  mode: 'fit',
  name,
  outputFormat: 'image/webp',
  quality: 80,
  searchText: `${name} ${description} ${tags.join(' ')}`.toLowerCase(),
  tags,
  usageNote: 'A practical starting point, not a universally mandatory platform requirement.',
  width,
});

export const dimensionPresets = [
  dimensionPreset('social-instagram-square', 'social-media', 'Instagram Square', 'Square post canvas for Instagram content.', 1080, 1080, ['instagram', 'social', 'square', 'post']),
  dimensionPreset('social-instagram-portrait', 'social-media', 'Instagram Portrait', 'Portrait post canvas for Instagram feeds.', 1080, 1350, ['instagram', 'social', 'portrait', 'post']),
  dimensionPreset('social-instagram-story-reel', 'social-media', 'Instagram Story/Reel', 'Vertical canvas for Instagram stories and reels.', 1080, 1920, ['instagram', 'story', 'reel', 'vertical']),
  dimensionPreset('social-facebook-post', 'social-media', 'Facebook Post', 'Landscape canvas for Facebook feed posts.', 1200, 630, ['facebook', 'social', 'post', 'landscape']),
  dimensionPreset('social-facebook-cover', 'social-media', 'Facebook Cover', 'Wide canvas for a Facebook cover image.', 820, 312, ['facebook', 'cover', 'wide']),
  dimensionPreset('social-linkedin-post', 'social-media', 'LinkedIn Post', 'Landscape canvas for LinkedIn feed posts.', 1200, 627, ['linkedin', 'social', 'post', 'landscape']),
  dimensionPreset('social-linkedin-cover', 'social-media', 'LinkedIn Cover', 'Wide canvas for a LinkedIn profile cover.', 1584, 396, ['linkedin', 'cover', 'wide']),
  dimensionPreset('social-pinterest-pin', 'social-media', 'Pinterest Pin', 'Tall canvas for Pinterest pins.', 1000, 1500, ['pinterest', 'pin', 'vertical']),

  dimensionPreset('website-hero', 'website-seo', 'Website Hero', 'Wide hero canvas for landing pages and website headers.', 1920, 800, ['website', 'hero', 'header', 'wide']),
  dimensionPreset('website-blog-featured', 'website-seo', 'Blog Featured', 'Landscape canvas for blog featured images and link previews.', 1200, 630, ['blog', 'featured', 'seo', 'landscape']),
  dimensionPreset('website-banner', 'website-seo', 'Website Banner', 'Wide banner canvas for website sections.', 1600, 500, ['website', 'banner', 'wide']),
  dimensionPreset('website-thumbnail', 'website-seo', 'Website Thumbnail', 'General-purpose website thumbnail canvas.', 600, 400, ['website', 'thumbnail', 'landscape']),
  dimensionPreset('website-small-thumbnail', 'website-seo', 'Small Thumbnail', 'Compact square thumbnail canvas.', 300, 300, ['website', 'thumbnail', 'small', 'square']),
  dimensionPreset('website-product-image', 'website-seo', 'Product Image', 'Square product canvas for website catalogs.', 1000, 1000, ['website', 'product', 'catalog', 'square']),

  dimensionPreset('video-youtube-thumbnail', 'video-platforms', 'YouTube Thumbnail', 'Landscape canvas for video thumbnails.', 1280, 720, ['youtube', 'thumbnail', 'video', 'landscape']),
  dimensionPreset('video-youtube-channel-art', 'video-platforms', 'YouTube Channel Art', 'Wide channel artwork canvas.', 2560, 1440, ['youtube', 'channel', 'cover', 'landscape']),
  dimensionPreset('video-youtube-profile', 'video-platforms', 'YouTube Profile', 'Square channel profile canvas.', 800, 800, ['youtube', 'profile', 'square']),

  dimensionPreset('ecommerce-amazon-product', 'e-commerce', 'Amazon Product', 'Square product canvas commonly used for catalog imagery.', 2000, 2000, ['amazon', 'product', 'catalog', 'square']),
  dimensionPreset('ecommerce-shopify-product', 'e-commerce', 'Shopify Product', 'Square product canvas for Shopify catalogs.', 2048, 2048, ['shopify', 'product', 'catalog', 'square']),
  dimensionPreset('ecommerce-product-thumbnail', 'e-commerce', 'Product Thumbnail', 'Compact square product thumbnail canvas.', 500, 500, ['ecommerce', 'product', 'thumbnail', 'square']),
  dimensionPreset('ecommerce-product-banner', 'e-commerce', 'Product Banner', 'Wide product promotion canvas.', 1600, 600, ['ecommerce', 'product', 'banner', 'wide']),

  dimensionPreset('profile-square', 'profile-cover', 'Square Profile', 'Square profile image canvas.', 800, 800, ['profile', 'avatar', 'square']),
  dimensionPreset('profile-portrait', 'profile-cover', 'Portrait Profile', 'Portrait profile image canvas.', 600, 800, ['profile', 'portrait']),
  dimensionPreset('profile-cover-photo', 'profile-cover', 'Cover Photo', 'Wide cover photo canvas.', 1500, 500, ['profile', 'cover', 'wide']),

  dimensionPreset('device-full-hd-wallpaper', 'device-screen', 'Full HD Wallpaper', 'Landscape wallpaper canvas for Full HD displays.', 1920, 1080, ['wallpaper', 'desktop', 'full-hd', 'landscape']),
  dimensionPreset('device-4k-wallpaper', 'device-screen', '4K Wallpaper', 'Landscape wallpaper canvas for 4K displays.', 3840, 2160, ['wallpaper', 'desktop', '4k', 'landscape']),
  dimensionPreset('device-mobile-wallpaper', 'device-screen', 'Mobile Wallpaper', 'Vertical wallpaper canvas for mobile screens.', 1080, 1920, ['wallpaper', 'mobile', 'phone', 'vertical']),
  dimensionPreset('device-tablet-wallpaper', 'device-screen', 'Tablet Wallpaper', 'Portrait wallpaper canvas for tablets.', 1536, 2048, ['wallpaper', 'tablet', 'portrait']),
];

const qualityPreset = (id, name, description, outputFormat, quality, tags) => ({
  id,
  categoryId: 'image-quality',
  description,
  kind: 'quality',
  name,
  outputFormat,
  quality,
  searchText: `${name} ${description} ${tags.join(' ')}`.toLowerCase(),
  tags,
});

export const qualityPresets = [
  qualityPreset('quality-high', 'High Quality', 'High-detail WebP output for visual fidelity.', 'image/webp', 90, ['webp', 'quality', 'high', 'detail']),
  qualityPreset('quality-balanced', 'Balanced', 'A practical balance between quality and file size.', 'image/webp', 80, ['webp', 'quality', 'balanced']),
  qualityPreset('quality-small-file', 'Small File', 'WebP output tuned for smaller downloads.', 'image/webp', 60, ['webp', 'quality', 'small', 'size']),
  qualityPreset('quality-web-optimized', 'Web Optimized', 'WebP output suited to typical web delivery.', 'image/webp', 75, ['webp', 'web', 'optimized']),
  qualityPreset('quality-transparent-png', 'Transparent PNG', 'Lossless PNG output for transparency-sensitive graphics.', 'image/png', null, ['png', 'transparent', 'lossless']),
  qualityPreset('quality-transparent-webp', 'Transparent WebP', 'WebP output for transparency with compact file sizes.', 'image/webp', 80, ['webp', 'transparent', 'alpha']),
];

export const customPresetTemplate = {
  categoryId: 'custom-presets',
  description: '',
  height: null,
  id: null,
  kind: 'dimension',
  mode: 'fit',
  name: '',
  outputFormat: 'image/webp',
  quality: 80,
  searchText: '',
  tags: [],
  width: null,
};

export const imagePresets = [...dimensionPresets, ...qualityPresets];

export const presetLibrary = {
  categories: PRESET_CATEGORIES,
  customPresetTemplate,
  dimensionPresets,
  imagePresets,
  qualityPresets,
};
