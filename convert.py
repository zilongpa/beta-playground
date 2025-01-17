import re
from bs4 import BeautifulSoup
import copy


def process(input_svg, template_file, output_file):
    """
    将SVG文件中的所有<path>和<text>标签替换为<motion.path>和<motion.text>标签，并插入额外的属性。
    :param input_svg: 输入的SVG文件路径，例如 "beta.svg"
    :param template_file: 输入的模板文件路径，例如 "beta.fragment.tsx"
    :param output_file: 输出的文件路径，例如 "output.tsx"
    """
    delay_dict = {
        "all +4"
    }
    
    # 读入SVG文件
    with open(input_svg, 'r', encoding='utf-8') as f:
        content = f.read()

    # 移除指定的XML和DOCTYPE标签
    content = re.sub(r'<\?xml[^>]*\?>', '', content)
    content = re.sub(r'<!DOCTYPE[^>]*>', '', content)

    # 移除所有包含 xmlns 的属性
    content = re.sub(r'\s+xmlns[^=]*="[^"]*"', '', content)

    # 移除所有包含 xml: 的属性
    content = re.sub(r'\s+xml:[^=]*="[^"]*"', '', content)

    # 移除所有包含 serif:id 的属性
    content = re.sub(r'\s+serif:id="[^"]*"', '', content)

    # 使用BeautifulSoup解析输出文件内容
    soup = BeautifulSoup(content, 'xml')

    # 查找所有的<motion.path>标签并隐藏id不是None的path
    # for path in soup.find_all('path'):
    #     parent = path.find_parent()
    #     if path.get('id') is None and (parent is None or parent.get('id') is None):
    #         path['style'] = 'display:none'
    #         print(1)
    # for path in soup.find_all('path'):
    #     parent = path.find_parent()
    #     if (path.get('id') and ('mux' in path.get('id') or 'alu' in path.get('id'))) or (parent and parent.get('id') and ('mux' in parent.get('id') or 'alu' in parent.get('id'))):
    #         path['type'] = 'static'
    for path in soup.find_all('path'):
        if path.get('id') and 'out-' in path.get('id') and 'out-z' not in path.get('id'):
            parent = path.find_parent()
            if parent and len(parent.find_all()) <= 16:
                for child in parent.find_all('path'):
                    child.name = 'motion.path'
                    if 'style' in child.attrs:
                        style = child['style']
                        style = re.sub(r'stroke:[^;]+;', '', style)
                        child['style'] = style
                    child['variants'] = '{{negative: (custom: any) => ({ fill: custom.previous.value ? "red" : "black", stroke: custom.previous.value ? "red" : "black", opacity: custom.previous.dirty ? 1 : 0.3, transition: { duration: 1 }}), positive: (custom: any) => ({ fill: custom.current.value ? "red" : "black", stroke: custom.current.value ? "red" : "black", opacity: custom.current.dirty ? 1 : 0.3, transition: { duration: 1 }})}}'
                    child['custom'] = '{{' + f"current: frame.cl.{path.get('id').split('-', 1)[1]}, previous: previousFrame.cl.{path.get('id').split('-', 1)[1]}" + '}}'
                    child["animate"] = "positive"
                    child["initial"] = "negative"
                for child in parent.find_all('text'):
                    child.name = 'motion.text'
                    if 'style' in child.attrs:
                        style = child['style']
                        style = re.sub(r'fill:[^;]+;', '', style)
                        child['style'] = style
                    child['variants'] = '{{negative: (custom: any) => ({ fill: custom.previous.value ? "red" : "black", stroke: custom.previous.value ? "red" : "black", opacity: custom.previous.dirty ? 1 : 0.3, transition: { duration: 1 }}), positive: (custom: any) => ({ fill: custom.current.value ? "red" : "black", stroke: custom.current.value ? "red" : "black", opacity: custom.current.dirty ? 1 : 0.3 , transition: { duration: 1 }})}}'
                    child['custom'] = '{{' + f"current: frame.cl.{path.get('id').split('-', 1)[1]}, previous: previousFrame.cl.{path.get('id').split('-', 1)[1]}" + '}}'
                    child["animate"] = "positive"
                    child["initial"] = "negative"

    for path in soup.find_all('path'):
        if path.get('id') and 'out-z' in path.get('id'):
            parent = path.find_parent()
            if parent and len(parent.find_all()) <= 16:
                for child in parent.find_all('path'):
                    child.name = 'motion.path'
                    if 'style' in child.attrs:
                        style = child['style']
                        style = re.sub(r'stroke:[^;]+;', '', style)
                        child['style'] = style
                    child['variants'] = '{{negative: (custom: any) => ({ fill: custom.previous.value ? "red" : "black", stroke: custom.previous.value ? "red" : "black", opacity: custom.previous.dirty ? 1 : 0.3, transition: { duration: 1 }}), positive: (custom: any) => ({ fill: custom.current.value ? "red" : "black", stroke: custom.current.value ? "red" : "black", opacity: custom.current.dirty ? 1 : 0.3, transition: { duration: 1 }})}}'
                    child['custom'] = '{{' + f"current: frame.flags.{path.get('id').split('-', 1)[1]}, previous: previousFrame.flags.{path.get('id').split('-', 1)[1]}" + '}}'
                    child["animate"] = "positive"
                    child["initial"] = "negative"
                for child in parent.find_all('text'):
                    child.name = 'motion.text'
                    if 'style' in child.attrs:
                        style = child['style']
                        style = re.sub(r'fill:[^;]+;', '', style)
                        child['style'] = style
                    child['variants'] = '{{negative: (custom: any) => ({ fill: custom.previous.value ? "red" : "black", stroke: custom.previous.value ? "red" : "black", opacity: custom.previous.dirty ? 1 : 0.3, transition: { duration: 1 }}), positive: (custom: any) => ({ fill: custom.current.value ? "red" : "black", stroke: custom.current.value ? "red" : "black", opacity: custom.current.dirty ? 1 : 0.3 , transition: { duration: 1 }})}}'
                    child['custom'] = '{{' + f"current: frame.flags.{path.get('id').split('-', 1)[1]}, previous: previousFrame.flags.{path.get('id').split('-', 1)[1]}" + '}}'
                    child["animate"] = "positive"
                    child["initial"] = "negative"

    noname = 0
    for path in soup.find_all('path'):
        if path.get('id') and 'path-' in path.get('id'):
            parent = path.find_parent()
            if parent and len(parent.find_all()) <= 32:
                for child in parent.find_all('path'):
                    new_child = copy.copy(child)
                    if 'id' in child.attrs:
                        new_child['id'] = f"foreground-{child['id']}"
                    else:
                        new_child['id'] = f'foreground-{noname}'
                        noname += 1
                    if 'style' in new_child.attrs:
                        style = new_child['style']
                        style = re.sub(r'stroke:[^;]+;', '', style)
                        new_child['style'] = style
                    new_child['variants'] = '{{negative: (custom: any) => ({ fill: custom.previous.value ? "red" : "black", stroke: custom.previous.value ? "red" : "black", opacity: custom.previous.dirty ? 1 : 0.3, pathLength: (custom.previous.value==custom.current.value && custom.previous.dirty==custom.current.dirty) ? 1 : 0, transition: { duration: 1 }}), positive: (custom: any) => ({ fill: custom.current.value ? "red" : "black", stroke: custom.current.value ? "red" : "black", opacity: custom.current.dirty ? 1 : 0.3, pathLength: 1 , transition: { duration: 1 }})}}'
                    new_child['custom'] = '{{' + f"current: frame.path['{path.get('id').split('-', 1)[1]}'], previous: previousFrame.path['{path.get('id').split('-', 1)[1]}']" + '}}'
                    new_child["animate"] = "positive"
                    new_child["initial"] = "negative"
                    new_child.name = 'motion.path'
                    parent.append(new_child)
                    
                    if 'style' in child.attrs:
                        style = child['style']
                        style = re.sub(r'stroke:[^;]+;', '', style)
                        child['style'] = style

                    child['variants'] = '{{negative: (custom: any) => ({ fill: custom.previous.value ? "red" : "black", stroke: custom.previous.value ? "red" : "black", opacity: (custom.previous.value==custom.current.value && custom.previous.dirty==custom.current.dirty) ? 0 : (custom.current.dirty ? 1 : 0.3), transition: { duration: 1 }}), positive: (custom: any) => ({ fill: custom.previous.value ? "red" : "black", stroke: custom.previous.value ? "red" : "black", opacity: 0, transition: { duration: 1 }})}}'
                    child['custom'] = '{{' + f"current: frame.path['{path.get('id').split('-', 1)[1]}'], previous: previousFrame.path['{path.get('id').split('-', 1)[1]}']" + '}}'
                    child["animate"] = "positive"
                    child["initial"] = "negative"
                    child.name = 'motion.path'
                    
                for child in parent.find_all('text'):
                    child.name = 'motion.text'
                    if 'style' in child.attrs:
                        style = child['style']
                        style = re.sub(r'fill:[^;]+;', '', style)
                        child['style'] = style
                    child['variants'] = '{{negative: (custom: any) => ({ fill: custom.previous.value ? "red" : "black", stroke: custom.previous.value ? "red" : "black", opacity: custom.previous.dirty ? 1 : 0.3, transition: { duration: 1 }}), positive: (custom: any) => ({ fill: custom.current.value ? "red" : "black", stroke: custom.current.value ? "red" : "black", opacity: custom.current.dirty ? 1 : 0.3 , transition: { duration: 1 }})}}'
                    child['custom'] = '{{' + f"current: frame.path['{path.get('id').split('-', 1)[1]}'], previous: previousFrame.path['{path.get('id').split('-', 1)[1]}']" + '}}'
                    child["animate"] = "positive"
                    child["initial"] = "negative"

    # 替换形如 style="..." 的属性为 style={{...}}
    def camel_case(match):
        parts = match.group(1).split('-')
        return parts[0] + ''.join(word.capitalize() for word in parts[1:])

    # # 替换<path>标签
    # for path in soup.find_all('path'):
    #     if not (path.get('type') == 'static'):
    #         path.name = 'motion.path'

    # # 替换<text>标签
    # for text in soup.find_all('text'):
    #     if not (text.get('type') == 'static'):
    #         text.name = 'motion.text'

    # # 为type=signal的path标签添加React属性
    # for path in soup.find_all('path'):
    #     if path.get('type') == 'signal':
    #         print(111)
    #         path.name = 'motion.path'
    #         path['initial'] = '{{ pathLength: 0 }}'
    #         path['animate'] = '{{ pathLength: 1 }}'

    # 将修改后的内容转换为字符串
    content = str(soup).replace('<?xml version="1.0" encoding="utf-8"?>', "")
    content = re.sub(r'style="([^"]*)"', lambda m: 'style={{' + ', '.join(f'{camel_case(re.match(r"([^:]+)", k.strip()))}:"{v.strip()}"' for k, v in (
        x.split(':') for x in m.group(1).split(';') if x.strip())) + '}}', content)
    
    
    content = content.replace('&gt;', '>')
    content = content.replace('&amp;', '&')

    content = content.replace('"{', '{').replace('}"', '}')
    content = content.replace("'{", '{').replace("}'", '}')
    # content = content.replace('"(', '(').replace(')"', ')')
    # content = content.replace("'(", '(').replace(")'", ')')


    with open(template_file, 'r', encoding='utf-8') as r:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(r.read().replace("<!-- INSERT_SVG_HERE -->", content))


if __name__ == "__main__":
    input_file = "beta.svg"
    template_file = "BetaVisualization.template.tsx"
    output_file = "src/BetaVisualization.tsx"
    process(input_file, template_file, output_file)
