window.LLM_GPU_CHECKER_DATA = window.LLM_GPU_CHECKER_DATA || {};

window.LLM_GPU_CHECKER_DATA.gpus = [
  { id: "custom", name: "직접 입력", vram: 24, ram: 64, bandwidth: 1008 },

  { id: "rtx5090-32", name: "GeForce RTX 5090 32GB", vram: 32, ram: 64, bandwidth: 1792, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/" },
  { id: "rtx5080-16", name: "GeForce RTX 5080 16GB", vram: 16, ram: 64, bandwidth: 960, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5080/" },
  { id: "rtx5070ti-16", name: "GeForce RTX 5070 Ti 16GB", vram: 16, ram: 64, bandwidth: 896, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5070-family/" },
  { id: "rtx5070-12", name: "GeForce RTX 5070 12GB", vram: 12, ram: 32, bandwidth: 672, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5070-family/" },
  { id: "rtx5060ti-16", name: "GeForce RTX 5060 Ti 16GB", vram: 16, ram: 32, bandwidth: 448, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/" },
  { id: "rtx5060ti-8", name: "GeForce RTX 5060 Ti 8GB", vram: 8, ram: 32, bandwidth: 448, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/" },
  { id: "rtx5060-8", name: "GeForce RTX 5060 8GB", vram: 8, ram: 32, bandwidth: 448, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/" },
  { id: "rtx5050-8", name: "GeForce RTX 5050 8GB", vram: 8, ram: 32, bandwidth: 320, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5050/" },

  { id: "rtx4090-24", name: "GeForce RTX 4090 24GB", vram: 24, ram: 64, bandwidth: 1008, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/" },
  { id: "rtx4080super-16", name: "GeForce RTX 4080 SUPER 16GB", vram: 16, ram: 64, bandwidth: 736, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4080-family/" },
  { id: "rtx4080-16", name: "GeForce RTX 4080 16GB", vram: 16, ram: 64, bandwidth: 717, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4080-family/" },
  { id: "rtx4070tisuper-16", name: "GeForce RTX 4070 Ti SUPER 16GB", vram: 16, ram: 64, bandwidth: 672, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4070-family/" },
  { id: "rtx4070ti-12", name: "GeForce RTX 4070 Ti 12GB", vram: 12, ram: 32, bandwidth: 504, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4070-family/" },
  { id: "rtx4070super-12", name: "GeForce RTX 4070 SUPER 12GB", vram: 12, ram: 32, bandwidth: 504, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4070-family/" },
  { id: "rtx4070-12", name: "GeForce RTX 4070 12GB", vram: 12, ram: 32, bandwidth: 504, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4070-family/" },
  { id: "rtx4060ti-16", name: "GeForce RTX 4060 Ti 16GB", vram: 16, ram: 32, bandwidth: 288, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4060-4060ti/" },
  { id: "rtx4060ti-8", name: "GeForce RTX 4060 Ti 8GB", vram: 8, ram: 32, bandwidth: 288, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4060-4060ti/" },
  { id: "rtx4060-8", name: "GeForce RTX 4060 8GB", vram: 8, ram: 32, bandwidth: 272, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4060-4060ti/" },
  {
    id: "rtx4090laptop-16",
    name: "GeForce RTX 4090 Laptop GPU 16GB",
    vram: 16,
    ram: 64,
    bandwidth: 576,
    formFactor: "laptop",
    tgpMinW: 80,
    tgpMaxW: 175,
    tgpReferenceW: 150,
    aliases: ["RTX 4090 Laptop", "4090 Mobile"],
    sourceUrl: "https://www.nvidia.com/en-us/geforce/laptops/40-series/",
  },
  {
    id: "rtx4080laptop-12",
    name: "GeForce RTX 4080 Laptop GPU 12GB",
    vram: 12,
    ram: 32,
    bandwidth: 432,
    formFactor: "laptop",
    tgpMinW: 60,
    tgpMaxW: 175,
    tgpReferenceW: 150,
    aliases: ["RTX 4080 Laptop", "4080 Mobile"],
    sourceUrl: "https://www.nvidia.com/en-us/geforce/laptops/40-series/",
  },
  {
    id: "rtx4070laptop-8",
    name: "GeForce RTX 4070 Laptop GPU 8GB",
    vram: 8,
    ram: 32,
    bandwidth: 256,
    formFactor: "laptop",
    tgpMinW: 35,
    tgpMaxW: 140,
    tgpReferenceW: 115,
    aliases: ["RTX 4070 Laptop", "4070 Mobile"],
    sourceUrl: "https://www.nvidia.com/en-us/geforce/laptops/40-series/",
  },

  {
    id: "rtx5090laptop-24", name: "GeForce RTX 5090 Laptop GPU 24GB",
    vram: 24, ram: 64, bandwidth: 896, vendor: "NVIDIA", architecture: "Blackwell",
    memoryType: "dedicated", formFactor: "laptop", tgpMinW: 95, tgpMaxW: 150, tgpReferenceW: 150,
    aliases: ["RTX 5090 Laptop", "5090 Mobile"], runtimes: ["CUDA"],
    sourceUrl: "https://www.nvidia.com/en-us/geforce/laptops/50-series/",
  },
  {
    id: "rtx5080laptop-16", name: "GeForce RTX 5080 Laptop GPU 16GB",
    vram: 16, ram: 64, bandwidth: 896, vendor: "NVIDIA", architecture: "Blackwell",
    memoryType: "dedicated", formFactor: "laptop", tgpMinW: 80, tgpMaxW: 150, tgpReferenceW: 150,
    aliases: ["RTX 5080 Laptop", "5080 Mobile"], runtimes: ["CUDA"],
    sourceUrl: "https://www.nvidia.com/en-us/geforce/laptops/50-series/",
  },
  {
    id: "rtx5070tilaptop-12", name: "GeForce RTX 5070 Ti Laptop GPU 12GB",
    vram: 12, ram: 32, bandwidth: 672, vendor: "NVIDIA", architecture: "Blackwell",
    memoryType: "dedicated", formFactor: "laptop", tgpMinW: 60, tgpMaxW: 115, tgpReferenceW: 115,
    aliases: ["RTX 5070 Ti Laptop", "5070 Ti Mobile"], runtimes: ["CUDA"],
    sourceUrl: "https://www.nvidia.com/en-us/geforce/laptops/50-series/",
  },
  {
    id: "rtx5070laptop-8", name: "GeForce RTX 5070 Laptop GPU 8GB",
    vram: 8, ram: 32, bandwidth: 384, vendor: "NVIDIA", architecture: "Blackwell",
    memoryType: "dedicated", formFactor: "laptop", tgpMinW: 50, tgpMaxW: 100, tgpReferenceW: 100,
    aliases: ["RTX 5070 Laptop", "5070 Mobile"], runtimes: ["CUDA"],
    sourceUrl: "https://www.nvidia.com/en-us/geforce/laptops/50-series/",
  },
  {
    id: "rtx5060laptop-8", name: "GeForce RTX 5060 Laptop GPU 8GB",
    vram: 8, ram: 32, bandwidth: 384, vendor: "NVIDIA", architecture: "Blackwell",
    memoryType: "dedicated", formFactor: "laptop", tgpMinW: 45, tgpMaxW: 100, tgpReferenceW: 100,
    aliases: ["RTX 5060 Laptop", "5060 Mobile"], runtimes: ["CUDA"],
    sourceUrl: "https://www.nvidia.com/en-us/geforce/laptops/50-series/",
  },

  { id: "rtx3090ti-24", name: "GeForce RTX 3090 Ti 24GB", vram: 24, ram: 64, bandwidth: 1008, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3090-3090ti/" },
  { id: "rtx3090-24", name: "GeForce RTX 3090 24GB", vram: 24, ram: 64, bandwidth: 936, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3090-3090ti/" },
  { id: "rtx3080ti-12", name: "GeForce RTX 3080 Ti 12GB", vram: 12, ram: 32, bandwidth: 912, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3080-3080ti/" },
  { id: "rtx3080-12", name: "GeForce RTX 3080 12GB", vram: 12, ram: 32, bandwidth: 912, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3080-3080ti/" },
  { id: "rtx3080-10", name: "GeForce RTX 3080 10GB", vram: 10, ram: 32, bandwidth: 760, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3080-3080ti/" },
  { id: "rtx3070ti-8", name: "GeForce RTX 3070 Ti 8GB", vram: 8, ram: 32, bandwidth: 608, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3070-3070ti/" },
  { id: "rtx3070-8", name: "GeForce RTX 3070 8GB", vram: 8, ram: 32, bandwidth: 448, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3070-3070ti/" },
  { id: "rtx3060ti-8", name: "GeForce RTX 3060 Ti 8GB", vram: 8, ram: 32, bandwidth: 448, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3060-3060ti/" },
  { id: "rtx3060-12", name: "GeForce RTX 3060 12GB", vram: 12, ram: 32, bandwidth: 360, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3060-3060ti/" },
  { id: "rtx3050-8", name: "GeForce RTX 3050 8GB", vram: 8, ram: 16, bandwidth: 224, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3050/" },
  { id: "rtx2080ti-11", name: "GeForce RTX 2080 Ti 11GB", vram: 11, ram: 32, bandwidth: 616, sourceUrl: "https://www.techpowerup.com/review/nvidia-geforce-rtx-2080-ti-founders-edition/" },
  { id: "rtx2080super-8", name: "GeForce RTX 2080 SUPER 8GB", vram: 8, ram: 32, bandwidth: 496, sourceUrl: "https://www.techpowerup.com/review/nvidia-geforce-rtx-2080-super-founders-edition/" },
  { id: "rtx2070super-8", name: "GeForce RTX 2070 SUPER 8GB", vram: 8, ram: 32, bandwidth: 448, sourceUrl: "https://www.techpowerup.com/review/nvida-geforce-rtx-2070-super/" },
  { id: "rtx2070-8", name: "GeForce RTX 2070 8GB", vram: 8, ram: 32, bandwidth: 448, sourceUrl: "https://www.techpowerup.com/review/nvidia-geforce-rtx-2070-founders-edition/" },
  { id: "rtx2060super-8", name: "GeForce RTX 2060 SUPER 8GB", vram: 8, ram: 32, bandwidth: 448, sourceUrl: "https://www.techpowerup.com/review/nvidia-geforce-rtx-2060-super/" },
  { id: "rtx2060-6", name: "GeForce RTX 2060 6GB", vram: 6, ram: 16, bandwidth: 336, sourceUrl: "https://www.techpowerup.com/review/nvidia-geforce-rtx-2060-founders-edition/" },
  { id: "rtx2050-4", name: "GeForce RTX 2050 4GB", vram: 4, ram: 16, bandwidth: 112, sourceUrl: "https://www.techpowerup.com/gpu-specs/lenovo-rtx-2050-mobile.b10243" },

  { id: "gtx1080ti-11", name: "GeForce GTX 1080 Ti 11GB (구형·개인용)", vram: 11, ram: 32, bandwidth: 484, sourceUrl: "https://www.techpowerup.com/review/nvidia-geforce-gtx-1080-ti/" },
  { id: "gtx1080-8", name: "GeForce GTX 1080 8GB (구형·개인용)", vram: 8, ram: 32, bandwidth: 320, sourceUrl: "https://www.techpowerup.com/review/nvidia-geforce-gtx-1080/" },
  { id: "gtx1070ti-8", name: "GeForce GTX 1070 Ti 8GB (구형·개인용)", vram: 8, ram: 32, bandwidth: 256, sourceUrl: "https://www.techpowerup.com/review/nvidia-geforce-gtx-1070-ti/" },
  { id: "gtx1070-8", name: "GeForce GTX 1070 8GB (구형·개인용)", vram: 8, ram: 32, bandwidth: 256, sourceUrl: "https://www.techpowerup.com/review/nvidia-geforce-gtx-1070/" },
  { id: "gtx1060-6", name: "GeForce GTX 1060 6GB (구형·개인용)", vram: 6, ram: 16, bandwidth: 192, sourceUrl: "https://www.techpowerup.com/review/nvidia-geforce-gtx-1060/" },
  { id: "gtx1660ti-6", name: "GeForce GTX 1660 Ti 6GB (구형·개인용)", vram: 6, ram: 16, bandwidth: 288, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/16-series/" },
  { id: "gtx1660super-6", name: "GeForce GTX 1660 SUPER 6GB (구형·개인용)", vram: 6, ram: 16, bandwidth: 336, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/16-series/" },
  { id: "gtx1660-6", name: "GeForce GTX 1660 6GB (구형·개인용)", vram: 6, ram: 16, bandwidth: 192, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/16-series/" },
  { id: "gtx1650super-4", name: "GeForce GTX 1650 SUPER 4GB (구형·개인용)", vram: 4, ram: 16, bandwidth: 192, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/16-series/" },
  { id: "gtx1650-4", name: "GeForce GTX 1650 4GB (구형·개인용)", vram: 4, ram: 16, bandwidth: 128, sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/16-series/" },
  {
    id: "p102-100-10",
    name: "NVIDIA P102-100 10GB (채굴카드·GP102)",
    vram: 10,
    ram: 16,
    bandwidth: 440.3,
    sourceUrl: "https://www.techpowerup.com/gpu-specs/zotac-p102-100.b5306",
  },

  { id: "rtxpro6000blackwell-96", name: "RTX PRO 6000 Blackwell 96GB", vram: 96, ram: 256, bandwidth: 1792, sourceUrl: "https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-6000-family/" },
  { id: "rtxpro5000blackwell-72", name: "RTX PRO 5000 Blackwell 72GB", vram: 72, ram: 192, bandwidth: 1344, vendor: "NVIDIA", architecture: "Blackwell", tbpW: 300, sourceUrl: "https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-5000/" },
  { id: "rtxpro5000blackwell-48", name: "RTX PRO 5000 Blackwell 48GB", vram: 48, ram: 128, bandwidth: 1344, vendor: "NVIDIA", architecture: "Blackwell", tbpW: 300, sourceUrl: "https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-5000/" },
  { id: "rtxpro4500blackwell-32", name: "RTX PRO 4500 Blackwell 32GB", vram: 32, ram: 96, bandwidth: 896, vendor: "NVIDIA", architecture: "Blackwell", tbpW: 200, sourceUrl: "https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-4500/" },
  { id: "rtxpro4000blackwell-24", name: "RTX PRO 4000 Blackwell 24GB", vram: 24, ram: 64, bandwidth: 672, vendor: "NVIDIA", architecture: "Blackwell", tbpW: 145, sourceUrl: "https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-4000/" },
  { id: "rtxpro4000sffblackwell-24", name: "RTX PRO 4000 SFF Blackwell 24GB", vram: 24, ram: 64, bandwidth: 432, vendor: "NVIDIA", architecture: "Blackwell", tbpW: 70, sourceUrl: "https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-4000-sff/" },
  { id: "rtxpro2000blackwell-16", name: "RTX PRO 2000 Blackwell 16GB", vram: 16, ram: 64, bandwidth: 288, vendor: "NVIDIA", architecture: "Blackwell", tbpW: 70, sourceUrl: "https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-2000/" },
  { id: "rtx6000ada-48", name: "RTX 6000 Ada 48GB", vram: 48, ram: 128, bandwidth: 960 , sourceUrl: "https://www.nvidia.com/en-us/products/workstations/rtx-6000/" },
  { id: "rtx5000ada-32", name: "RTX 5000 Ada 32GB", vram: 32, ram: 128, bandwidth: 576 , sourceUrl: "https://www.nvidia.com/en-us/products/workstations/rtx-5000/" },
  { id: "rtx4500ada-24", name: "RTX 4500 Ada 24GB", vram: 24, ram: 96, bandwidth: 432 , sourceUrl: "https://www.nvidia.com/en-us/products/workstations/rtx-4500/" },
  { id: "rtx4000ada-20", name: "RTX 4000 Ada 20GB", vram: 20, ram: 64, bandwidth: 360 , sourceUrl: "https://www.nvidia.com/en-us/products/workstations/rtx-4000/" },
  { id: "rtx4000sffada-20", name: "RTX 4000 SFF Ada 20GB", vram: 20, ram: 64, bandwidth: 280 , sourceUrl: "https://www.nvidia.com/en-us/products/workstations/rtx-4000-sff/" },
  { id: "rtxa6000-48", name: "RTX A6000 48GB", vram: 48, ram: 128, bandwidth: 768 , sourceUrl: "https://www.nvidia.com/en-us/products/workstations/rtx-a6000/" },
  { id: "rtxa5000-24", name: "RTX A5000 24GB", vram: 24, ram: 96, bandwidth: 768 , sourceUrl: "https://www.nvidia.com/en-us/products/workstations/rtx-a5000/" },
  { id: "rtxa4500-20", name: "RTX A4500 20GB", vram: 20, ram: 64, bandwidth: 640 , sourceUrl: "https://www.nvidia.com/en-us/products/workstations/rtx-a4500/" },
  { id: "rtxa4000-16", name: "RTX A4000 16GB", vram: 16, ram: 64, bandwidth: 448 , sourceUrl: "https://www.nvidia.com/en-us/products/workstations/rtx-a4000/" },
  { id: "quadrortx8000-48", name: "Quadro RTX 8000 48GB", vram: 48, ram: 128, bandwidth: 672, sourceUrl: "https://www.nvidia.com/en-us/design-visualization/previous-quadro-desktop-gpus/" },
  { id: "quadrortx6000-24", name: "Quadro RTX 6000 24GB", vram: 24, ram: 96, bandwidth: 672, sourceUrl: "https://www.nvidia.com/en-us/design-visualization/previous-quadro-desktop-gpus/" },
  { id: "titanrtx-24", name: "Titan RTX 24GB", vram: 24, ram: 64, bandwidth: 672 , sourceUrl: "https://www.nvidia.com/en-us/deep-learning-ai/products/titan-rtx/" },

  { id: "dgxspark-gb10-128", name: "NVIDIA GB10 / DGX Spark 128GB 통합메모리", vram: 128, ram: 128, bandwidth: 273, vendor: "NVIDIA", architecture: "Grace Blackwell", memoryType: "unified", formFactor: "integrated", gpuUsableMemoryGb: 109, runtimes: ["CUDA"], aliases: ["DGX Spark", "GB10", "Grace Blackwell Spark"], sourceUrl: "https://www.nvidia.com/en-us/products/workstations/dgx-spark/" },
  { id: "b300-288", enterpriseOnly: true, name: "NVIDIA B300 (Blackwell Ultra) 288GB", vram: 288, ram: 768, bandwidth: 8000, vendor: "NVIDIA", architecture: "Blackwell Ultra", formFactor: "datacenter", tbpW: 1400, sourceUrl: "https://www.nvidia.com/en-us/data-center/dgx-b300/" },
  { id: "b200-192", enterpriseOnly: true, name: "NVIDIA B200 192GB", vram: 192, ram: 512, bandwidth: 8000, sourceUrl: "https://www.nvidia.com/en-us/data-center/technologies/blackwell-architecture/" },
  { id: "b100-192", enterpriseOnly: true, name: "NVIDIA B100 192GB", vram: 192, ram: 512, bandwidth: 8000, sourceUrl: "https://www.nvidia.com/en-us/data-center/technologies/blackwell-architecture/" },
  { id: "h200-141", enterpriseOnly: true, name: "NVIDIA H200 SXM 141GB", vram: 141, ram: 384, bandwidth: 4800, sourceUrl: "https://www.nvidia.com/en-us/data-center/h200/" },
  { id: "h100-sxm-80", enterpriseOnly: true, name: "NVIDIA H100 SXM 80GB", vram: 80, ram: 256, bandwidth: 3350, sourceUrl: "https://www.nvidia.com/en-us/data-center/h100/" },
  { id: "h100-pcie-80", enterpriseOnly: true, name: "NVIDIA H100 PCIe 80GB", vram: 80, ram: 256, bandwidth: 2000, sourceUrl: "https://www.nvidia.com/en-us/data-center/h100/" },
  { id: "h100-nvl-94", enterpriseOnly: true, name: "NVIDIA H100 NVL 94GB", vram: 94, ram: 256, bandwidth: 3900, sourceUrl: "https://www.nvidia.com/en-us/data-center/h100/" },
  { id: "a100-sxm-80", enterpriseOnly: true, name: "NVIDIA A100 SXM 80GB", vram: 80, ram: 256, bandwidth: 2039, sourceUrl: "https://www.nvidia.com/en-us/data-center/a100/" },
  { id: "a100-pcie-80", enterpriseOnly: true, name: "NVIDIA A100 PCIe 80GB", vram: 80, ram: 256, bandwidth: 1935, sourceUrl: "https://www.nvidia.com/en-us/data-center/a100/" },
  { id: "a100-40", enterpriseOnly: true, name: "NVIDIA A100 40GB", vram: 40, ram: 128, bandwidth: 1555, sourceUrl: "https://www.nvidia.com/en-us/data-center/a100/" },
  { id: "l40s-48", enterpriseOnly: true, name: "NVIDIA L40S 48GB", vram: 48, ram: 128, bandwidth: 864, sourceUrl: "https://www.nvidia.com/en-us/data-center/l40s/" },
  { id: "l40-48", enterpriseOnly: true, name: "NVIDIA L40 48GB", vram: 48, ram: 128, bandwidth: 864 , sourceUrl: "https://www.nvidia.com/en-us/data-center/l40/" },
  { id: "l4-24", enterpriseOnly: true, name: "NVIDIA L4 24GB", vram: 24, ram: 64, bandwidth: 300 , sourceUrl: "https://www.nvidia.com/en-us/data-center/l4/" },
  { id: "a40-48", enterpriseOnly: true, name: "NVIDIA A40 48GB", vram: 48, ram: 128, bandwidth: 696 , sourceUrl: "https://www.nvidia.com/en-us/data-center/a40/" },
  { id: "a30-24", enterpriseOnly: true, name: "NVIDIA A30 24GB", vram: 24, ram: 96, bandwidth: 933 , sourceUrl: "https://www.nvidia.com/en-us/data-center/products/a30-gpu/" },
  { id: "a10-24", enterpriseOnly: true, name: "NVIDIA A10 24GB", vram: 24, ram: 64, bandwidth: 600 , sourceUrl: "https://www.nvidia.com/en-us/data-center/products/a10-gpu/" },
  { id: "t4-16", enterpriseOnly: true, name: "NVIDIA T4 16GB", vram: 16, ram: 64, bandwidth: 320 , sourceUrl: "https://www.nvidia.com/en-us/data-center/tesla-t4/" },
  { id: "v100-32", enterpriseOnly: true, name: "NVIDIA V100 32GB", vram: 32, ram: 128, bandwidth: 900 , sourceUrl: "https://images.nvidia.com/content/technologies/volta/pdf/tesla-volta-v100-datasheet-letter-fnl-web.pdf" },
  { id: "p100-16", enterpriseOnly: true, name: "NVIDIA P100 16GB", vram: 16, ram: 64, bandwidth: 732 , sourceUrl: "https://www.nvidia.com/en-us/data-center/tesla-p100/" },
  { id: "tesla-p40-24", enterpriseOnly: true, name: "NVIDIA Tesla P40 24GB (구형·저가형 추론용)", vram: 24, ram: 64, bandwidth: 346, vendor: "NVIDIA", architecture: "Pascal", formFactor: "datacenter", sourceUrl: "https://images.nvidia.com/content/pdf/tesla/184427-Tesla-P40-Datasheet-NV-Final-Letter-Web.pdf" },
  { id: "tesla-m40-24", enterpriseOnly: true, name: "NVIDIA Tesla M40 24GB (구형·저가형 추론용)", vram: 24, ram: 64, bandwidth: 288, vendor: "NVIDIA", architecture: "Maxwell", formFactor: "datacenter", sourceUrl: "https://www.techpowerup.com/gpu-specs/tesla-m40-24-gb.c2758" },
  { id: "tesla-p4-8", enterpriseOnly: true, name: "NVIDIA Tesla P4 8GB (구형·저전력 추론용)", vram: 8, ram: 32, bandwidth: 192, vendor: "NVIDIA", architecture: "Pascal", formFactor: "datacenter", sourceUrl: "https://images.nvidia.com/content/pdf/tesla/184457-Tesla-P4-Datasheet-NV-Final-Letter-Web.pdf" },

  { id: "mi355x-288", enterpriseOnly: true, name: "AMD Instinct MI355X 288GB", vram: 288, ram: 768, bandwidth: 8000, vendor: "AMD", architecture: "CDNA 4", tbpW: 1400, sourceUrl: "https://www.amd.com/content/dam/amd/en/documents/instinct-tech-docs/product-briefs/amd-instinct-mi355x-gpu-brochure.pdf" },
  { id: "mi350x-288", enterpriseOnly: true, name: "AMD Instinct MI350X 288GB", vram: 288, ram: 768, bandwidth: 8000, vendor: "AMD", architecture: "CDNA 4", tbpW: 1000, sourceUrl: "https://www.amd.com/content/dam/amd/en/documents/instinct-tech-docs/product-briefs/amd-instinct-mi350x-gpu-brochure.pdf" },
  { id: "mi325x-256", enterpriseOnly: true, name: "AMD Instinct MI325X 256GB", vram: 256, ram: 512, bandwidth: 6000 , sourceUrl: "https://www.amd.com/en/products/accelerators/instinct/mi300/mi325x.html" },
  { id: "mi300x-192", enterpriseOnly: true, name: "AMD Instinct MI300X 192GB", vram: 192, ram: 512, bandwidth: 5300 , sourceUrl: "https://www.amd.com/en/products/accelerators/instinct/mi300/mi300x.html" },
  { id: "mi250x-128", enterpriseOnly: true, name: "AMD Instinct MI250X 128GB", vram: 128, ram: 384, bandwidth: 3277 , sourceUrl: "https://www.amd.com/en/products/accelerators/instinct/mi200/mi250x.html" },
  { id: "mi210-64", enterpriseOnly: true, name: "AMD Instinct MI210 64GB", vram: 64, ram: 256, bandwidth: 1638 , sourceUrl: "https://www.amd.com/en/products/accelerators/instinct/mi200/mi210.html" },
  { id: "r9700-32", name: "Radeon AI PRO R9700 32GB", vram: 32, ram: 96, bandwidth: 640 , sourceUrl: "https://www.amd.com/en/products/graphics/workstations/radeon-ai-pro/ai-9000-series/amd-radeon-ai-pro-r9700.html" },
  { id: "w7900-48", name: "Radeon PRO W7900 48GB", vram: 48, ram: 128, bandwidth: 864 , sourceUrl: "https://www.amd.com/en/products/graphics/workstations/radeon-pro/w7900-dual-slot.html" },
  { id: "w7800-32", name: "Radeon PRO W7800 32GB", vram: 32, ram: 96, bandwidth: 576 , sourceUrl: "https://www.amd.com/en/products/graphics/workstations/radeon-pro/w7800.html" },
  { id: "w7700-16", name: "Radeon PRO W7700 16GB", vram: 16, ram: 64, bandwidth: 576 , sourceUrl: "https://www.amd.com/en/products/graphics/workstations/radeon-pro/w7700.html" },
  { id: "w6800-32", name: "Radeon PRO W6800 32GB", vram: 32, ram: 96, bandwidth: 512 , sourceUrl: "https://www.amd.com/en/products/graphics/workstations/radeon-pro/w6800.html" },
  { id: "rx9070xt-16", name: "Radeon RX 9070 XT 16GB", vram: 16, ram: 64, bandwidth: 640 , sourceUrl: "https://www.amd.com/en/products/graphics/desktops/radeon/9000-series/amd-radeon-rx-9070xt.html" },
  { id: "rx9070-16", name: "Radeon RX 9070 16GB", vram: 16, ram: 64, bandwidth: 640, vendor: "AMD", architecture: "RDNA 4", memoryType: "dedicated", runtimes: ["ROCm", "Vulkan"], sourceUrl: "https://www.amd.com/en/products/graphics/desktops/radeon/9000-series/amd-radeon-rx-9070.html" },
  { id: "rx9070gre-12", name: "Radeon RX 9070 GRE 12GB", vram: 12, ram: 32, bandwidth: 432, vendor: "AMD", architecture: "RDNA 4", tbpW: 220, sourceUrl: "https://www.amd.com/en/products/graphics/desktops/radeon/9000-series/amd-radeon-rx-9070-gre.html" },
  { id: "rx9060xt-16", name: "Radeon RX 9060 XT 16GB", vram: 16, ram: 32, bandwidth: 320, vendor: "AMD", architecture: "RDNA 4", tbpW: 160, sourceUrl: "https://www.amd.com/en/products/graphics/desktops/radeon/9000-series/amd-radeon-rx-9060xt.html" },
  { id: "rx9060xt-8", name: "Radeon RX 9060 XT 8GB", vram: 8, ram: 32, bandwidth: 320, vendor: "AMD", architecture: "RDNA 4", tbpW: 160, sourceUrl: "https://www.amd.com/en/products/graphics/desktops/radeon/9000-series/amd-radeon-rx-9060xt-8gb.html" },
  { id: "rx7900xtx-24", name: "Radeon RX 7900 XTX 24GB", vram: 24, ram: 64, bandwidth: 960 , sourceUrl: "https://www.amd.com/en/products/graphics/desktops/radeon/7000-series/amd-radeon-rx-7900xtx.html" },
  { id: "rx7900xt-20", name: "Radeon RX 7900 XT 20GB", vram: 20, ram: 64, bandwidth: 800 , sourceUrl: "https://www.amd.com/en/products/graphics/desktops/radeon/7000-series/amd-radeon-rx-7900xt.html" },
  { id: "rx7900gre-16", name: "Radeon RX 7900 GRE 16GB", vram: 16, ram: 64, bandwidth: 576, sourceUrl: "https://www.amd.com/en/products/graphics/desktops/radeon/7000-series/amd-radeon-rx-7900-gre.html" },
  { id: "rx7800xt-16", name: "Radeon RX 7800 XT 16GB", vram: 16, ram: 64, bandwidth: 624 , sourceUrl: "https://www.amd.com/en/products/graphics/desktops/radeon/7000-series/amd-radeon-rx-7800-xt.html" },
  { id: "rx6950xt-16", name: "Radeon RX 6950 XT 16GB", vram: 16, ram: 64, bandwidth: 576 , sourceUrl: "https://www.amd.com/en/products/graphics/desktops/radeon/6000-series/amd-radeon-rx-6950-xt.html" },
  { id: "rx6800xt-16", name: "Radeon RX 6800 XT 16GB (구형·개인용)", vram: 16, ram: 64, bandwidth: 512 , sourceUrl: "https://www.amd.com/en/products/graphics/desktops/radeon/6000-series/amd-radeon-rx-6800-xt.html" },
  { id: "rx6800-16", name: "Radeon RX 6800 16GB (구형·개인용)", vram: 16, ram: 64, bandwidth: 512 , sourceUrl: "https://www.amd.com/en/products/graphics/desktops/radeon/6000-series/amd-radeon-rx-6800.html" },
  { id: "rx6750xt-12", name: "Radeon RX 6750 XT 12GB (구형·개인용)", vram: 12, ram: 32, bandwidth: 432 , sourceUrl: "https://www.amd.com/en/products/graphics/desktops/radeon/6000-series/amd-radeon-rx-6750-xt.html" },
  { id: "rx6700xt-12", name: "Radeon RX 6700 XT 12GB (구형·개인용)", vram: 12, ram: 32, bandwidth: 384 , sourceUrl: "https://www.amd.com/en/products/graphics/desktops/radeon/6000-series/amd-radeon-rx-6700-xt.html" },
  { id: "rx6650xt-8", name: "Radeon RX 6650 XT 8GB (구형·개인용)", vram: 8, ram: 32, bandwidth: 280 , sourceUrl: "https://www.amd.com/en/products/graphics/desktops/radeon/6000-series/amd-radeon-rx-6650-xt.html" },
  { id: "rx6600xt-8", name: "Radeon RX 6600 XT 8GB (구형·개인용)", vram: 8, ram: 32, bandwidth: 256 , sourceUrl: "https://www.amd.com/en/products/graphics/desktops/radeon/6000-series/amd-radeon-rx-6600-xt.html" },
  { id: "rx6600-8", name: "Radeon RX 6600 8GB (구형·개인용)", vram: 8, ram: 32, bandwidth: 224 , sourceUrl: "https://www.amd.com/en/products/graphics/desktops/radeon/6000-series/amd-radeon-rx-6600.html" },
  { id: "rx6500xt-4", name: "Radeon RX 6500 XT 4GB (구형·개인용)", vram: 4, ram: 16, bandwidth: 144, sourceUrl: "https://www.amd.com/en/products/graphics/desktops/radeon/6000-series/amd-radeon-rx-6500-xt.html" },
  { id: "rx5700xt-8", name: "Radeon RX 5700 XT 8GB (구형·개인용)", vram: 8, ram: 32, bandwidth: 448, sourceUrl: "https://www.techpowerup.com/review/amd-radeon-rx-5700-xt/" },
  { id: "rx5600xt-6", name: "Radeon RX 5600 XT 6GB (구형·개인용)", vram: 6, ram: 16, bandwidth: 288, sourceUrl: "https://www.techpowerup.com/review/powercolor-radeon-rx-5600-xt-red-dragon/" },
  { id: "rx580-8", name: "Radeon RX 580 8GB (구형·개인용)", vram: 8, ram: 16, bandwidth: 256, sourceUrl: "https://www.techpowerup.com/review/msi-rx-580-mech-2/" },
  {
    id: "ryzen-ai-max-plus-395-32",
    name: "AMD Ryzen AI Max+ 395 / Radeon 8060S 32GB 통합메모리",
    vram: 32,
    ram: 32,
    bandwidth: 256,
    vendor: "AMD",
    architecture: "RDNA 3.5 / Strix Halo",
    memoryType: "unified",
    gpuUsableMemoryGb: 24,
    runtimes: ["Vulkan", "DirectML", "ROCm 확인"],
    aliases: ["AI Max 395 32GB", "Ryzen 395 32GB", "395+ 32GB", "Radeon 8060S 32GB", "Strix Halo 32GB", "Max+ 32GB"],
    sourceUrl: "https://www.amd.com/en/products/processors/laptop/ryzen/ai-300-series/amd-ryzen-ai-max-plus-395.html",
  },
  {
    id: "ryzen-ai-max-plus-395-64",
    name: "AMD Ryzen AI Max+ 395 / Radeon 8060S 64GB 통합메모리",
    vram: 64,
    ram: 64,
    bandwidth: 256,
    vendor: "AMD",
    architecture: "RDNA 3.5 / Strix Halo",
    memoryType: "unified",
    gpuUsableMemoryGb: 48,
    runtimes: ["Vulkan", "DirectML", "ROCm 확인"],
    aliases: ["AI Max 395 64GB", "Ryzen 395 64GB", "395+ 64GB", "Radeon 8060S 64GB", "Strix Halo 64GB", "Max+ 64GB"],
    sourceUrl: "https://www.amd.com/en/products/processors/laptop/ryzen/ai-300-series/amd-ryzen-ai-max-plus-395.html",
  },
  {
    id: "ryzen-ai-max-plus-395-96",
    name: "AMD Ryzen AI Max+ 395 / Radeon 8060S 96GB 통합메모리",
    vram: 96,
    ram: 96,
    bandwidth: 256,
    vendor: "AMD",
    architecture: "RDNA 3.5 / Strix Halo",
    memoryType: "unified",
    gpuUsableMemoryGb: 72,
    runtimes: ["Vulkan", "DirectML", "ROCm 확인"],
    aliases: ["AI Max 395 96GB", "Ryzen 395 96GB", "395+ 96GB", "Radeon 8060S 96GB", "Strix Halo 96GB", "Max+ 96GB"],
    sourceUrl: "https://www.amd.com/en/products/processors/laptop/ryzen/ai-300-series/amd-ryzen-ai-max-plus-395.html",
  },
  {
    id: "ryzen-ai-max-plus-395-128",
    name: "AMD Ryzen AI Max+ 395 / Radeon 8060S 128GB 통합메모리",
    vram: 128,
    ram: 128,
    bandwidth: 256,
    vendor: "AMD",
    architecture: "RDNA 3.5 / Strix Halo",
    memoryType: "unified",
    gpuUsableMemoryGb: 96,
    runtimes: ["Vulkan", "DirectML", "ROCm 확인"],
    aliases: ["AI Max 395", "Ryzen 395", "395+", "Radeon 8060S", "Strix Halo", "Max+ 128GB"],
    sourceUrl: "https://www.amd.com/en/products/processors/laptop/ryzen/ai-300-series/amd-ryzen-ai-max-plus-395.html",
  },

  // AMD Radeon 780M (RDNA3 iGPU in Ryzen 7040/8040 "Phoenix"/"Hawk Point" laptops/mini-PCs).
  // No dedicated VRAM -- shares system RAM. Per cpu-monkey.com's official spec table: up to
  // 4GB can be reserved as dedicated iGPU memory, and the iGPU can use up to 32GB of system
  // memory overall (that ceiling is independent of how much RAM is actually installed).
  // Bandwidth varies by RAM: DDR5-5600 dual-channel (by far the most common real-world config)
  // measures ~80-85GB/s; LPDDR5X-7500 dual-channel is faster but rare in practice per the same
  // source. Using the DDR5-5600 figure here as the representative/common case.
  {
    id: "radeon-780m-32",
    name: "AMD Radeon 780M (Ryzen 7040/8040) 32GB 통합메모리",
    vram: 32,
    ram: 32,
    bandwidth: 83,
    vendor: "AMD",
    architecture: "RDNA 3",
    memoryType: "unified",
    gpuUsableMemoryGb: 32,
    runtimes: ["Vulkan", "DirectML", "ROCm 확인"],
    aliases: ["Radeon 780M", "780M", "Ryzen 7840U", "Ryzen 7840HS", "Ryzen 8840HS", "Phoenix iGPU", "Hawk Point iGPU"],
    sourceUrl: "https://www.cpu-monkey.com/en/igpu-amd_radeon_780m",
  },

  { id: "intelmax1550-128", enterpriseOnly: true, name: "Intel Data Center GPU Max 1550 128GB", vram: 128, ram: 384, bandwidth: 3276.8 , sourceUrl: "https://www.intel.com/content/www/us/en/products/sku/232873/intel-data-center-gpu-max-1550/specifications.html" },
  { id: "intelmax1100-48", enterpriseOnly: true, name: "Intel Data Center GPU Max 1100 48GB", vram: 48, ram: 128, bandwidth: 1228.8 , sourceUrl: "https://www.intel.com/content/www/us/en/products/sku/232876/intel-data-center-gpu-max-1100/specifications.html" },
  { id: "intelflex170-16", enterpriseOnly: true, name: "Intel Data Center GPU Flex 170 16GB", vram: 16, ram: 64, bandwidth: 576 , sourceUrl: "https://www.intel.com/content/www/us/en/products/sku/230019/intel-data-center-gpu-flex-170/specifications.html" },
  { id: "intelflex140-12", enterpriseOnly: true, name: "Intel Data Center GPU Flex 140 12GB", vram: 12, ram: 64, bandwidth: 336 , sourceUrl: "https://www.intel.com/content/www/us/en/products/sku/230020/intel-data-center-gpu-flex-140/specifications.html" },
  { id: "arca770-16", name: "Intel Arc A770 16GB", vram: 16, ram: 64, bandwidth: 560 , sourceUrl: "https://www.intel.com/content/www/us/en/products/sku/229151/intel-arc-a770-graphics-16gb/specifications.html" },
  { id: "arcb580-12", name: "Intel Arc B580 12GB", vram: 12, ram: 32, bandwidth: 456, vendor: "Intel", architecture: "Xe2 Battlemage", memoryType: "dedicated", runtimes: ["OpenVINO", "oneAPI", "DirectML"], sourceUrl: "https://www.intel.com/content/www/us/en/ark/products/series/240391/intel-arc-b-series-graphics.html" },
  { id: "arcb570-10", name: "Intel Arc B570 10GB", vram: 10, ram: 32, bandwidth: 380, vendor: "Intel", architecture: "Xe2 Battlemage", memoryType: "dedicated", runtimes: ["OpenVINO", "oneAPI", "DirectML"], sourceUrl: "https://www.intel.com/content/www/us/en/ark/products/series/240391/intel-arc-b-series-graphics.html" },
  { id: "arcprob70-32", name: "Intel Arc Pro B70 32GB", vram: 32, ram: 96, bandwidth: 608, vendor: "Intel", architecture: "Xe2 Battlemage", tbpW: 290, runtimes: ["OpenVINO", "oneAPI", "DirectML"], sourceUrl: "https://www.intel.com/content/www/us/en/products/docs/discrete-gpus/arc/workstations/b-series/overview.html" },
  { id: "arcprob65-32", name: "Intel Arc Pro B65 32GB", vram: 32, ram: 96, bandwidth: 608, vendor: "Intel", architecture: "Xe2 Battlemage", tbpW: 200, runtimes: ["OpenVINO", "oneAPI", "DirectML"], sourceUrl: "https://www.intel.com/content/www/us/en/products/docs/discrete-gpus/arc/workstations/b-series/overview.html" },
  { id: "arcprob60-24", name: "Intel Arc Pro B60 24GB", vram: 24, ram: 64, bandwidth: 456, vendor: "Intel", architecture: "Xe2 Battlemage", tbpW: 200, runtimes: ["OpenVINO", "oneAPI", "DirectML"], sourceUrl: "https://www.intel.com/content/www/us/en/products/docs/discrete-gpus/arc/workstations/b-series/overview.html" },
  { id: "arcprob50-16", name: "Intel Arc Pro B50 16GB", vram: 16, ram: 64, bandwidth: 224, vendor: "Intel", architecture: "Xe2 Battlemage", tbpW: 70, runtimes: ["OpenVINO", "oneAPI", "DirectML"], sourceUrl: "https://www.intel.com/content/www/us/en/products/docs/discrete-gpus/arc/workstations/b-series/overview.html" },

  // gpuUsableMemoryGb below reflects each platform's own documented safe-allocation ceiling,
  // not a uniform guess: Apple Silicon exposes Metal's recommendedMaxWorkingSetSize, which is
  // consistently ~75% of total unified memory across generations (developer.apple.com/documentation/
  // metal/mtldevice/recommendedmaxworkingsetsize; community-verified e.g. 128GB M1 Ultra -> ~96GB).
  // AMD Ryzen AI Max+ 395 (Strix Halo) caps GPU-assignable memory at 96GB of 128GB (75%) via
  // Variable Graphics Memory on Windows / GTT on Linux -- see the ryzen-ai-max-plus-395 entries below.
  // NVIDIA DGX Spark (GB10) runs a Linux-based single-purpose AI appliance OS with much lower desktop
  // overhead, so community guidance (vLLM/CUDA on unified memory) puts the safe ceiling higher, around
  // 85-87% before risking OOM against the page cache -- 85% is used here.
  // M5 Max bandwidth depends on GPU core count; do not give the 32-core bin
  // the 40-core bin's bandwidth. GPU-usable memory remains our 75% planning
  // allowance, not Apple's guaranteed allocatable VRAM or a measured result.
  { id: "m5max-128", name: "Apple M5 Max 40-core GPU 128GB 통합메모리", vram: 128, ram: 128, bandwidth: 614, vendor: "Apple", architecture: "Apple M5", memoryType: "unified", formFactor: "integrated", gpuUsableMemoryGb: 96, runtimes: ["Metal", "MLX"], aliases: ["M5 Max 128GB", "MacBook Pro M5 Max 128GB"], sourceUrl: "https://www.apple.com/macbook-pro/specs/", verifiedAt: "2026-09-30" },
  { id: "m5max-64", name: "Apple M5 Max 40-core GPU 64GB 통합메모리", vram: 64, ram: 64, bandwidth: 614, vendor: "Apple", architecture: "Apple M5", memoryType: "unified", formFactor: "integrated", gpuUsableMemoryGb: 48, runtimes: ["Metal", "MLX"], aliases: ["M5 Max 64GB", "MacBook Pro M5 Max 64GB"], sourceUrl: "https://www.apple.com/macbook-pro/specs/", verifiedAt: "2026-09-30" },
  { id: "m5max-36", name: "Apple M5 Max 32-core GPU 36GB 통합메모리", vram: 36, ram: 36, bandwidth: 460, vendor: "Apple", architecture: "Apple M5", memoryType: "unified", formFactor: "integrated", gpuUsableMemoryGb: 27, runtimes: ["Metal", "MLX"], aliases: ["M5 Max 36GB", "MacBook Pro M5 Max 36GB"], sourceUrl: "https://www.apple.com/macbook-pro/specs/", verifiedAt: "2026-09-30" },
  { id: "m5pro-64", name: "Apple M5 Pro 20-core GPU 64GB 통합메모리", vram: 64, ram: 64, bandwidth: 307, vendor: "Apple", architecture: "Apple M5", memoryType: "unified", formFactor: "integrated", gpuUsableMemoryGb: 48, runtimes: ["Metal", "MLX"], aliases: ["M5 Pro 64GB", "MacBook Pro M5 Pro"], sourceUrl: "https://www.apple.com/macbook-pro/specs/", verifiedAt: "2026-09-30" },
  { id: "m5-32", name: "Apple M5 10-core GPU 32GB 통합메모리", vram: 32, ram: 32, bandwidth: 153, vendor: "Apple", architecture: "Apple M5", memoryType: "unified", formFactor: "integrated", gpuUsableMemoryGb: 24, runtimes: ["Metal", "MLX"], aliases: ["M5 32GB", "MacBook Pro M5"], sourceUrl: "https://www.apple.com/macbook-pro/specs/", verifiedAt: "2026-09-30" },
  // Mac Studio official specifications; 75% GPU allocation is a planning
  // allowance, not measured LLM speed or Apple's guaranteed allocatable VRAM.
  { id: "m5ultra-96", name: "Apple Mac Studio M5 Ultra 64-core GPU 96GB 통합메모리", vram: 96, ram: 96, bandwidth: 1200, vendor: "Apple", architecture: "Apple M5", memoryType: "unified", formFactor: "integrated", gpuUsableMemoryGb: 72, runtimes: ["Metal", "MLX"], aliases: ["M5 Ultra 96GB", "Mac Studio M5 Ultra"], sourceUrl: "https://www.apple.com/mac-studio/specs/", verifiedAt: "2026-10-07" },
  { id: "m5ultra-256", name: "Apple Mac Studio M5 Ultra 80-core GPU 256GB 통합메모리", vram: 256, ram: 256, bandwidth: 1200, vendor: "Apple", architecture: "Apple M5", memoryType: "unified", formFactor: "integrated", gpuUsableMemoryGb: 192, runtimes: ["Metal", "MLX"], requiresSystemQuote: true, aliases: ["M5 Ultra 256GB", "Mac Studio M5 Ultra 256GB"], sourceUrl: "https://www.apple.com/mac-studio/specs/", verifiedAt: "2026-10-07" },
  // Published per-GPU specifications, not whole-rack memory/bandwidth.
  // These rack/module accelerators require a supplier system quote.
  { id: "rubin-288", name: "NVIDIA Rubin 288GB HBM4", vram: 288, ram: 1024, bandwidth: 22000, vendor: "NVIDIA", architecture: "Rubin", memoryType: "dedicated", formFactor: "datacenter", enterpriseOnly: true, requiresSystemQuote: true, runtimes: ["CUDA"], aliases: ["Vera Rubin", "Rubin GPU", "Vera Rubin NVL72"], sourceUrl: "https://developer.nvidia.com/blog/inside-the-nvidia-rubin-platform-six-new-chips-one-ai-supercomputer/", verifiedAt: "2026-09-30" },
  { id: "mi455x-432", name: "AMD Instinct MI455X 432GB", vram: 432, ram: 1024, bandwidth: 23300, vendor: "AMD", architecture: "CDNA 5", memoryType: "dedicated", formFactor: "datacenter", enterpriseOnly: true, requiresSystemQuote: true, runtimes: ["ROCm"], aliases: ["MI455X", "MI400", "Helios"], sourceUrl: "https://www.amd.com/en/products/accelerators/instinct/mi400/mi455x.html", verifiedAt: "2026-09-30" },
  { id: "m3ultra-512", name: "Apple M3 Ultra 512GB 통합메모리", vram: 512, ram: 512, bandwidth: 819, vendor: "Apple", architecture: "Apple Silicon", memoryType: "unified", formFactor: "integrated", gpuUsableMemoryGb: 384, runtimes: ["Metal", "MLX"], aliases: ["M3 Ultra", "Mac Studio M3 Ultra"], sourceUrl: "https://support.apple.com/en-us/122211" },
  { id: "m2ultra-192", name: "Apple M2 Ultra 192GB 통합메모리", vram: 192, ram: 192, bandwidth: 800, vendor: "Apple", architecture: "Apple Silicon", memoryType: "unified", formFactor: "integrated", gpuUsableMemoryGb: 144, runtimes: ["Metal", "MLX"], aliases: ["M2 Ultra", "Mac Studio M2 Ultra"], sourceUrl: "https://support.apple.com/en-us/111835" },
  { id: "m4max-128", name: "Apple M4 Max 128GB 통합메모리", vram: 128, ram: 128, bandwidth: 546, vendor: "Apple", architecture: "Apple Silicon", memoryType: "unified", formFactor: "integrated", gpuUsableMemoryGb: 96, runtimes: ["Metal", "MLX"], aliases: ["M4 Max", "Mac Studio M4 Max"], sourceUrl: "https://support.apple.com/en-us/122211" },
  { id: "m3max-128", name: "Apple M3 Max 128GB 통합메모리", vram: 128, ram: 128, bandwidth: 400, vendor: "Apple", architecture: "Apple Silicon", memoryType: "unified", formFactor: "integrated", gpuUsableMemoryGb: 96, runtimes: ["Metal", "MLX"], aliases: ["M3 Max", "MacBook Pro M3 Max"], sourceUrl: "https://support.apple.com/en-us/117736" },
  { id: "m2max-96", name: "Apple M2 Max 96GB 통합메모리", vram: 96, ram: 96, bandwidth: 400, vendor: "Apple", architecture: "Apple Silicon", memoryType: "unified", formFactor: "integrated", gpuUsableMemoryGb: 72, runtimes: ["Metal", "MLX"], aliases: ["M2 Max", "MacBook Pro M2 Max"], sourceUrl: "https://support.apple.com/en-us/111835" },
  { id: "m4pro-64", name: "Apple M4 Pro 64GB 통합메모리", vram: 64, ram: 64, bandwidth: 273, vendor: "Apple", architecture: "Apple Silicon", memoryType: "unified", formFactor: "integrated", gpuUsableMemoryGb: 48, runtimes: ["Metal", "MLX"], aliases: ["M4 Pro", "Mac mini M4 Pro"], sourceUrl: "https://support.apple.com/en-us/121555" },
  { id: "m4-32", name: "Apple M4 32GB 통합메모리", vram: 32, ram: 32, bandwidth: 120, vendor: "Apple", architecture: "Apple Silicon", memoryType: "unified", formFactor: "integrated", gpuUsableMemoryGb: 24, runtimes: ["Metal", "MLX"], aliases: ["M4", "Mac mini M4"], sourceUrl: "https://support.apple.com/en-us/121555" },
];

function officialGpuFamilySource(vendor, text) {
  if (vendor === "NVIDIA") {
    if (/geforce|rtx 20|rtx 30|rtx 40|rtx 50/.test(text)) {
      return "https://www.nvidia.com/en-us/geforce/graphics-cards/compare/?section=compare-specs";
    }
    return "https://www.nvidia.com/en-us/data-center/";
  }
  if (vendor === "AMD") {
    if (/instinct|mi\d/.test(text)) return "https://www.amd.com/en/products/accelerators/instinct.html";
    if (/ryzen ai/.test(text)) return "https://www.amd.com/en/products/processors/consumer/ryzen-ai.html";
    if (/radeon pro|w\d/.test(text)) return "https://www.amd.com/en/products/graphics/workstations.html";
    return "https://www.amd.com/en/products/graphics/desktops/radeon.html";
  }
  if (vendor === "Intel") return "https://www.intel.com/content/www/us/en/products/details/discrete-gpus.html";
  if (vendor === "Apple") return "https://support.apple.com/en-us/102231";
  return "";
}

window.LLM_GPU_CHECKER_DATA.gpus = window.LLM_GPU_CHECKER_DATA.gpus.map((gpu) => {
  const text = `${gpu.id} ${gpu.name}`.toLowerCase();
  const vendor = gpu.vendor || (
    /nvidia|geforce|quadro|titan|rtx|dgx|h100|a100|b200|tesla/.test(text) ? "NVIDIA"
      : /amd|radeon|ryzen|instinct|mi\d/.test(text) ? "AMD"
        : /apple|m\d(?:max|ultra)/.test(text) ? "Apple"
          : /intel|arc|flex/.test(text) ? "Intel"
            : "Other"
  );
  const architecture = gpu.architecture || (
    /rtx 50|blackwell|b200|b100/.test(text) ? "Blackwell"
      : /rtx 40|ada/.test(text) ? "Ada Lovelace"
        : /rtx 30|a100|a30|a10/.test(text) ? "Ampere"
          : /h100|h200/.test(text) ? "Hopper"
            : /rx 90|r9700/.test(text) ? "RDNA 4"
              : /rx 7|w7/.test(text) ? "RDNA 3"
                : /mi3/.test(text) ? "CDNA 3"
                  : /mi2/.test(text) ? "CDNA 2"
                    : vendor === "Apple" ? "Apple Silicon"
                      : "Unspecified"
  );
  const memoryType = gpu.memoryType || (/통합메모리|unified|dgx spark|ryzen ai/.test(text) ? "unified" : "dedicated");
  const runtimeDefaults = vendor === "NVIDIA"
    ? ["CUDA"]
    : vendor === "AMD"
      ? (memoryType === "unified" ? ["Vulkan", "DirectML", "ROCm-check"] : ["ROCm", "Vulkan"])
      : vendor === "Apple"
        ? ["Metal", "MLX"]
        : vendor === "Intel"
          ? ["OpenVINO", "oneAPI"]
          : [];
  const familySourceUrl = officialGpuFamilySource(vendor, text);
  return {
    aliases: [],
    vendor,
    architecture,
    memoryType,
    gpuUsableMemoryGb: gpu.vram,
    runtimes: runtimeDefaults,
    formFactor: /laptop|mobile/.test(text)
      ? "laptop"
      : /instinct|data center|h100|h200|b100|b200|a100|a30|t4|v100|p100|l40|l4|flex/.test(text)
        ? "datacenter"
        : memoryType === "unified" ? "integrated" : "desktop",
    ...gpu,
    sourceUrl: gpu.sourceUrl || familySourceUrl,
  };
}).map((entry) => {
  // A model-specific sourceUrl only counts as "official" (sourceScope:
  // "model"/specStatus: "sourced" — shown to users as an "Official" badge)
  // when it actually points at the manufacturer's own domain. Older/legacy
  // GPUs the vendor no longer hosts a current spec page for may instead cite
  // a reputable third-party database (e.g. TechPowerUp); those are detected
  // here by hostname rather than trusting a manually-set flag, so a future
  // non-manufacturer sourceUrl can never silently get mislabeled "official"
  // just because someone forgot to flag it.
  const isOfficialDomain = !entry.sourceUrl
    ? false
    // Allow any subdomain of the vendor's own domain (e.g. images.nvidia.com
    // hosting a PDF datasheet) to still count as "official" -- what matters
    // is that the content is first-party, not which subdomain served it.
    : /^https?:\/\/(?:[a-z0-9-]+\.)*(nvidia\.com|amd\.com|intel\.com|apple\.com)(\/|$)/i.test(entry.sourceUrl);
  const hasModelSpecificUrl = Boolean(entry.sourceUrl) && entry.sourceUrl !== officialGpuFamilySource(entry.vendor, `${entry.id} ${entry.name}`.toLowerCase());
  return {
    ...entry,
    sourceScope: !entry.sourceUrl
      ? "missing"
      : !hasModelSpecificUrl
        ? "family"
        : isOfficialDomain
          ? "model"
          : "reference",
    specStatus: !entry.sourceUrl
      ? "estimated"
      : !hasModelSpecificUrl
        ? "family"
        : isOfficialDomain
          ? "sourced"
          : "reference",
  };
});
