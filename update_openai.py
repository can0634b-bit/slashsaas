import re

with open('src/lib/engines/openai.ts', 'r', encoding='utf-8') as f:
    text = f.read()

new_create = '''        const response = await openai.responses.create({
          model,
          input: [
            { role: 'developer', content: 'Use web search to find current information and cite your sources with URLs. Do not answer from prior knowledge alone.' },
            { role: 'user', content: promptText }
          ],
          tools: [{ type: 'web_search' }],
          tool_choice: 'required'
        });
        
        let rawResponse = '';
        const citationsSet = new Map<string, string>(); // url -> title
        let searchUsed = false;
        
        // --- 1A: Diagnostics FIRST ---
        const itemTypes = (response.output || []).map(item => item.type).join(', ');
        const hasWebSearchCall = (response.output || []).some(item => item.type === 'web_search_call' || (item as any).type === 'tool_call');
        const debugString = `[DEBUG] model: ${model} | output_items: [${itemTypes}] | web_search_call: ${hasWebSearchCall} | usage: ${JSON.stringify(response.usage)}`;
        console.log(debugString);
'''

text = re.sub(
    r'const response = await openai\.responses\.create\(\{.*?\}\);\s*let rawResponse = \'\';\s*const citationsSet = new Map<string, string>\(\); // url -> title\s*let searchUsed = false;',
    new_create,
    text,
    flags=re.DOTALL
)

new_raw_resp = '''        if (!rawResponse && (response as any).output_text) {
           rawResponse = (response as any).output_text;
        }
        
        // Persist debug string invisibly in the raw_response
        rawResponse += `\\n\\n<!-- ${debugString} -->`;
'''

text = re.sub(
    r'if \(!rawResponse && \(response as any\)\.output_text\) \{\s*rawResponse = \(response as any\)\.output_text;\s*\}',
    new_raw_resp,
    text,
    flags=re.DOTALL
)

with open('src/lib/engines/openai.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated openai.ts")
