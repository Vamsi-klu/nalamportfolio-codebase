import os

def count_stats(root_dir):
    stats = {}
    total_lines = 0
    total_chars = 0
    
    skip_dirs = {'.git', '.venv', 'node_modules', '__pycache__', '.netlify', 'attached_assets'}
    extensions = {'.py', '.js', '.html', '.css', '.md', '.json'}

    print(f"{'Extension':<12} | {'Files':<6} | {'Lines':<8} | {'Chars':<10}")
    print("-" * 45)

    for root, dirs, files in os.walk(root_dir):
        # Modify dirs in-place to skip unwanted directories
        dirs[:] = [d for d in dirs if d not in skip_dirs and not d.startswith('.')]
        
        for file in files:
            ext = os.path.splitext(file)[1]
            if ext in extensions:
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        lines = len(content.splitlines())
                        chars = len(content)
                        
                        if ext not in stats:
                            stats[ext] = {'files': 0, 'lines': 0, 'chars': 0}
                        
                        stats[ext]['files'] += 1
                        stats[ext]['lines'] += lines
                        stats[ext]['chars'] += chars
                        
                        total_lines += lines
                        total_chars += chars
                except Exception as e:
                    print(f"Error reading {file_path}: {e}")

    for ext, data in sorted(stats.items(), key=lambda x: x[1]['lines'], reverse=True):
        print(f"{ext:<12} | {data['files']:<6} | {data['lines']:<8} | {data['chars']:<10}")
    
    print("-" * 45)
    print(f"{'TOTAL':<12} | {sum(d['files'] for d in stats.values()):<6} | {total_lines:<8} | {total_chars:<10}")

if __name__ == "__main__":
    count_stats('.')
