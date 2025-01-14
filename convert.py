import re


def replace_path_with_motion_path(input_svg, template_file, output_file, extra_attributes=None):
    """
    将SVG文件中的所有<path>标签替换为<motion.path>标签，并插入额外的属性。
    :param input_svg: 输入的SVG文件路径，例如 "beta.svg"
    :param template_file: 输入的模板文件路径，例如 "beta.fragment.tsx"
    :param output_file: 输出的文件路径，例如 "output.tsx"
    :param extra_attributes: 要插入到<motion.path>的额外属性，默认为 None
    """
    if extra_attributes is None:
        extra_attributes = {}

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

    # 替换形如 style="..." 的属性为 style={{...}}
    def camel_case(match):
        parts = match.group(1).split('-')
        return parts[0] + ''.join(word.capitalize() for word in parts[1:])

    content = re.sub(r'style="([^"]*)"', lambda m: 'style={{' + ', '.join(f'{camel_case(re.match(r"([^:]+)", k.strip()))}:"{v.strip()}"' for k, v in (
        x.split(':') for x in m.group(1).split(';') if x.strip())) + '}}', content)

    # 构建额外属性字符串
    extra_attrs_str = ' '.join(f'{k}={v}' for k, v in extra_attributes.items())

    # 1. 替换形如 <path ...> 的开标签为 <motion.path ... extra_attributes />
    #    使用正则捕获<path与>之间的所有内容，插入额外属性。
    #    注意：(?P<attrs>.*?) 以命名组attrs捕获所有属性内容。
    #    \s* 用来匹配空格、换行等可能存在的情况。
    pattern_open_tag = re.compile(
        r'<path(?P<attrs>.*?)/?>', flags=re.IGNORECASE | re.DOTALL)
    replacement_open_tag = rf'<motion.path\g<attrs> {extra_attrs_str} />'
    content = pattern_open_tag.sub(replacement_open_tag, content)

    # 2. 替换形如 </path> 的闭标签为 </motion.path>
    pattern_close_tag = re.compile(r'</path\s*>', re.IGNORECASE)
    replacement_close_tag = '</motion.path>'
    content = pattern_close_tag.sub(replacement_close_tag, content)

    with open(template_file, 'r', encoding='utf-8') as r:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(r.read().replace("<!-- INSERT_SVG_HERE -->", content))


if __name__ == "__main__":
    input_file = "beta.svg"
    template_file = "BetaVisualization.template.tsx"
    output_file = "src/BetaVisualization.tsx"
    extra_attrs = {
        "initial": "{{ pathLength: 0 }}",
        "animate": "{{ pathLength: 1 }}",
        "transition": "{{ duration: 2 }}"
    }
    replace_path_with_motion_path(
        input_file, template_file, output_file, extra_attrs)
    print(f"处理完毕，已生成 {output_file}。")
