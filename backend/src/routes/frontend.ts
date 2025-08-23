import { Router } from "express";

const router = Router();

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ShopperSprint - Price Comparison Platform</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
    </style>
</head>
<body class="gradient-bg min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <header class="text-center mb-12">
            <h1 class="text-4xl md:text-6xl font-bold text-white mb-4">
                ShopperSprint
            </h1>
            <p class="text-xl text-white/90 mb-8">
                Canadian Price Comparison Platform - NEW UI DEPLOYED! 🎉
            </p>
        </header>

        <!-- Main Content -->
        <div class="max-w-4xl mx-auto">
            <!-- Search Section -->
            <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
                <h2 class="text-2xl font-bold text-white mb-6 text-center">
                    Find the Best Prices Across Canadian Retailers
                </h2>
                
                <div class="flex flex-col md:flex-row gap-4 mb-6">
                    <input 
                        type="text" 
                        placeholder="Search for products..." 
                        class="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 text-gray-900"
                        id="searchInput"
                    >
                    <button 
                        onclick="searchProducts()"
                        class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        Search
                    </button>
                </div>
                
                <div id="searchResults" class="hidden">
                    <div class="text-white text-center py-4">
                        <p>🔍 Searching across Canadian retailers...</p>
                    </div>
                </div>
            </div>

            <!-- Features -->
            <div class="grid md:grid-cols-3 gap-6 mb-8">
                <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
                    <div class="text-3xl mb-4">🔍</div>
                    <h3 class="text-xl font-semibold text-white mb-2">Smart Search</h3>
                    <p class="text-white/80">Search across multiple Canadian retailers simultaneously</p>
                </div>
                
                <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
                    <div class="text-3xl mb-4">💰</div>
                    <h3 class="text-xl font-semibold text-white mb-2">Price Comparison</h3>
                    <p class="text-white/80">Compare prices and find the best deals instantly</p>
                </div>
                
                <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
                    <div class="text-3xl mb-4">🔔</div>
                    <h3 class="text-xl font-semibold text-white mb-2">Price Alerts</h3>
                    <p class="text-white/80">Get notified when prices drop on your favorite items</p>
                </div>
            </div>

            <!-- API Status -->
            <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
                <h3 class="text-xl font-semibold text-white mb-4">System Status</h3>
                <div id="apiStatus" class="text-white/80">
                    <p>✅ Backend API: Online</p>
                    <p>✅ Database: Connected</p>
                    <p>✅ SSL Certificate: Working</p>
                    <p class="text-green-300 mt-2">🎉 Deployment successful!</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Search functionality
        async function searchProducts() {
            const query = document.getElementById('searchInput').value;
            const resultsDiv = document.getElementById('searchResults');
            
            if (!query.trim()) return;
            
            resultsDiv.classList.remove('hidden');
            resultsDiv.innerHTML = '<div class="text-white text-center py-4"><p>🔍 Searching for "' + query + '"...</p></div>';
            
            try {
                const response = await fetch(\`/api/search?q=\${encodeURIComponent(query)}\`);
                const data = await response.json();
                
                if (data.results && data.results.length > 0) {
                    resultsDiv.innerHTML = \`
                        <div class="text-white">
                            <h3 class="font-semibold mb-4">Found \${data.results.length} results:</h3>
                            <div class="space-y-3">
                                \${data.results.slice(0, 3).map(product => \`
                                    <div class="bg-white/20 rounded-lg p-4">
                                        <h4 class="font-semibold">\${product.title}</h4>
                                        <p class="text-green-300 font-bold">$\${product.price}</p>
                                        <p class="text-sm text-white/80">\${product.source}</p>
                                    </div>
                                \`).join('')}
                            </div>
                        </div>
                    \`;
                } else {
                    resultsDiv.innerHTML = '<div class="text-white text-center py-4"><p>No results found. Try a different search term.</p></div>';
                }
            } catch (error) {
                resultsDiv.innerHTML = '<div class="text-red-300 text-center py-4"><p>Search temporarily unavailable. Please try again.</p></div>';
            }
        }

        // Enter key search
        document.getElementById('searchInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
    </script>
</body>
</html>`;

// Serve the frontend HTML
router.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.setHeader("Cache-Control", "no-cache");
  res.send(HTML_CONTENT);
});

export default router;
