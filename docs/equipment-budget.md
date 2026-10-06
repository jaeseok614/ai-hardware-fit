# Equipment-budget advisor

The model-to-GPU flow accepts a full-equipment budget (default) or a GPU-only upgrade budget. Model category/search determines the model filter; all recommendations must satisfy the existing model-fit calculation.

Text-LLM defaults are editable planning presets: personal chat/coding uses 4K context and one simultaneous request; personal long documents/RAG uses 16K and one request; small shared use uses 8K and four requests. Each starts with Q4_K_M weights, FP16 KV cache, 512 output tokens, llama.cpp, and 2GB memory reserve. The starting model is the catalogue's Qwen3.5 9B as an example, not a quality guarantee or a mandate to spend the full budget.

Per-request target speeds start at 20/15/10 tok/s for the three presets. These are subjective, editable planning preferences, not measured or universal usability thresholds. Zero removes the speed constraint. Below-target alternatives are explicitly marked. Legacy advanced-setting links have no new speed constraint.

These settings affect actual memory/speed estimates without overwriting the GPU finder's advanced settings. The effective context is limited by the selected model and the UI explicitly discloses any reduction. Per-request speed is not measured concurrent-service capacity; RAG embedding/indexing costs, training and vision inputs are outside this text-LLM baseline. Non-LLM workloads retain their existing workload-specific settings. Share links preserve all advisor assumptions; legacy advanced-setting links restore those settings as a custom preset.

For standalone desktop cards, equipment cost adds a planning CPU, socket-matched motherboard, RAM, 2TB SSD, PSU, case and cooling allowance. These are catalogue assumptions, not live retail quotations or exact-SKU compatibility certification. GPU dimensions, PSU connectors, BIOS and memory support must be checked before buying. Monitor, peripherals, OS, assembly, shipping and optional networking/UPS are excluded.

Rows explicitly marked `priceScope: "complete-system"` use their complete-system reference once, without adding PC parts again. DGX Spark uses the existing dated catalogue price. Mac Studio M5 Ultra 96GB/1TB uses Apple's Korean base starting price, not a live shop quote. M5 Ultra 256GB has no verified complete-system price in this catalogue: it is a quote-required memory-fit candidate, not a within-budget recommendation. The announced 512GB configuration is not added as an available purchase because Apple's release notice places availability in late October 2026.

Official sources checked 2026-10-07:

- [Apple Mac Studio specifications](https://www.apple.com/mac-studio/specs/)
- [Apple Korean launch price and availability](https://www.apple.com/kr/newsroom/2026/08/apple-introduces-new-mac-studio-with-m5-max-and-m5-ultra/)
- [NVIDIA DGX Spark specifications](https://www.nvidia.com/en-us/products/workstations/dgx-spark/)

Unknown complete-system prices never pass the budget test or become zero-cost chart points. Zero budget means no budget limit, not free equipment. Legacy links containing `budget` without `budgetScope` retain GPU-only semantics. New links include the selected scope.
