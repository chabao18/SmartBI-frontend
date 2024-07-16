import React, {useEffect, useState} from 'react';
import {listChartByPageUsingPost} from "@/services/smart-bi/chartController";
import {Avatar, Card, List, message, Result} from "antd";
import {useModel} from "@umijs/max";
import Search from "antd/es/input/Search";
import ReactECharts from "echarts-for-react";


const MyChart: React.FC = () => {

  const initSearchParams = {
    pageSize: 4,
    current: 1,
    sortField: 'createTime',
    sortOrder: 'desc',
  };

  const [searchParams, setSearchParams] = useState<API.ChartQueryRequest>(initSearchParams);
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState ?? {};
  // 存储图表数据
  const [chartList, setChartList] = useState<API.Chart[]>();
  // 数据总数
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // 获取数据的异步函数
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listChartByPageUsingPost(searchParams);
      if (res.data) {
        setChartList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);

        // 隐藏图表的 title
        if (res.data.records) {
          res.data.records.forEach(data => {
            if (data.status === 'succeed') {
              const chartOption = JSON.parse(data.genChart ?? '{}');
              chartOption.title = undefined;
              data.genChart = JSON.stringify(chartOption);
            }
          })
        }

      } else {
        message.error('获取我的图表失败');
      }

    } catch (e:any) {
      message.error('获取我的图表失败, ' + e.message);
    }
    setLoading(false);
  }

  // 首次加载页面时，触发加载数据
  useEffect(() => {
    loadData();
    }, [searchParams]);

  return (
    <div className="my-chart-page">
      <div>
        <Search
          placeholder="请输入图表名称"
          enterButton
          loading={loading}
          onSearch={(value) => {
            // 设置搜索条件
            setSearchParams({
              ...initSearchParams,
              name: value,
            });
          }}
        />
      </div>
      <div className="margin-16" />
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 1,
          lg: 2,
          xl: 2,
          xxl: 2,
        }}
        pagination={{
          onChange: (page, pageSize) => {
            setSearchParams({
              ...searchParams,
              current: page,
              pageSize,
            });
          },
          current: searchParams.current,
          pageSize: searchParams.pageSize,
          total: total,
        }}
        loading={loading}
        dataSource={chartList}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <Card style={{ width: '100%' }}>
              <List.Item.Meta
                avatar={<Avatar src={currentUser && currentUser.userAvatar} />}
                title={item.name}
                description={item.chartType ? '图表类型：' + item.chartType : undefined}
              />
              <div style={{ marginBottom: 16 }} />
              <p>{'分析目标' + item.goal}</p>
              <div style={{ marginBottom: 16 }} />
              <ReactECharts option={item.genChart && JSON.parse(item.genChart)} />
            </Card>
          </List.Item>
        )}
      />
    </div>
  );

};

export default MyChart;
