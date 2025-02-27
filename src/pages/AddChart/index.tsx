import React, {useState} from 'react';
import {genChartByAiUsingPost} from "@/services/smart-bi/chartController";
import { UploadOutlined } from '@ant-design/icons';
import {
  Button, Card,
  Col, Divider,
  Form, Input,
  message,
  Row,
  Select,
  Space, Spin,
  Upload,
} from 'antd';
import TextArea from "antd/es/input/TextArea";
import ReactECharts from 'echarts-for-react';



const AddChart: React.FC = () => {


  const [chart, setChart] = useState<API.BiResponse>()
  const [option, setOption] = useState<any>();
  const [submitting, setSubmitting] = useState<boolean>(false);


  const onFinish = async (values: any) => {
    // 避免重复提交
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setChart(undefined);
    setOption(undefined);

    const params = {
      ...values,
      file: undefined,
    };
    try {
      const res = await genChartByAiUsingPost(params, {}, values.file.file.originFileObj);
      if (!res?.data) {
        message.error('分析失败');
      } else {
        message.success('分析成功');

//         res.data.genChart = `{
//   "xAxis": {
//     "type": "category",
//     "data": ["1号", "2号", "3号"]
//   },
//   "yAxis": {
//     "type": "value"
//   },
//   "series": [{
//     "data": [10, 20, 30],
//     "type": "line"
//   }]
// }`;
        console.log(res.data.genChart);

        // 解析成对象，为空则设置为空字符串
        const chartOption = JSON.parse(res.data.genChart ?? '');

        console.log(chartOption);

        // 如果为空，则抛出异常
        if (!chartOption) {
          throw new Error('图表代码解析错误')
        } else {

          // 从后端得到响应，设置图表数据
          setChart(res.data);
          setOption(chartOption);
        }
      }

      // 异常情况下，提示分析失败+具体失败原因
    } catch (e: any) {
      message.error('分析失败，' + e.message);
    }

    // 无论成功失败，都设置提交状态为false
    setSubmitting(false);
  };


  return (
    <div className="add-chart">
      <Row gutter={24}>
        <Col span={12}>
          <Card title="智能分析">
            <Form name="addChart" labelAlign="left" labelCol={{span: 4}}
                  wrapperCol={{span: 16}} onFinish={onFinish} initialValues={{}}>
              <Form.Item
                name="goal"
                label="分析目标"
                rules={[{required: true, message: '请输入分析目标'}]}
              >
                <TextArea placeholder="请输入你的分析需求，比如：分析网站用户的增长情况"/>
              </Form.Item>

              <Form.Item name="name" label="图表名称">
                <Input placeholder="请输入图表名称"/>
              </Form.Item>

              <Form.Item name="chartType" label="图表类型">
                <Select
                  options={[
                    {value: '折线图', label: '折线图'},
                    {value: '柱状图', label: '柱状图'},
                    {value: '堆叠图', label: '堆叠图'},
                    {value: '饼图', label: '饼图'},
                    {value: '雷达图', label: '雷达图'},
                  ]}
                />
              </Form.Item>

              <Form.Item name="file" label="原始数据">
                <Upload name="file" maxCount={1}>
                  <Button icon={<UploadOutlined/>}>上传 CSV 文件</Button>
                </Upload>
              </Form.Item>

              <Form.Item wrapperCol={{span: 16, offset: 4}}>
                <Space>
                  <Button type="primary" htmlType="submit">
                    提交
                  </Button>
                  <Button htmlType="reset">重置</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="分析结论">
            {chart?.genResult ?? <div>请先在左侧进行提交</div>}
            <Spin spinning={submitting}/>
          </Card>
          <Divider />
          <Card title="可视化图表">
            {
              option ? <ReactECharts option={option} /> : <div>请先在左侧进行提交</div>
            }
            <Spin spinning={submitting}/>
          </Card>
        </Col>

      </Row>
    </div>

  );
};

export default AddChart;
