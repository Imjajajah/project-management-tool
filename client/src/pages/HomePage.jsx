import React, { useEffect, useState } from "react";
import { getToken } from "../utils/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function HomePage() {
  const [summary, setSummary] = useState({
    totalProjects: 0,
    totalTasks: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
    upcomingTasks: [],
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const serverUrl = import.meta.env.VITE_SERVER_URL;
        const token = getToken();
        const response = await fetch(`${serverUrl}/api/homepage/summary`, {
          headers: {
            "x-auth-token": token,
          },
        });
        const data = await response.json();
        setSummary(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchSummary();
  }, []);

  const chartData = [
    { name: "To Do", value: summary.todo },
    { name: "In Progress", value: summary.inProgress },
    { name: "Done", value: summary.done },
  ];

  return (
    <div className="container py-4">
      <h2 className="fw-bold text-start mb-4">📊 Dashboard Overview</h2>

      {/* Top Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 text-center h-100">
            <div className="card-body">
              <h5 className="text-muted">Projects</h5>
              <h2 className="fw-bold text-primary">{summary.totalProjects}</h2>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 text-center h-100">
            <div className="card-body">
              <h5 className="text-muted">Tasks</h5>
              <h2 className="fw-bold text-success">{summary.totalTasks}</h2>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 text-center h-100">
            <div className="card-body">
              <h5 className="text-muted">Completed</h5>
              <h2 className="fw-bold text-success">{summary.done}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="fw-bold text-secondary mb-3">Task Progress</h5>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#012d74" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h5 className="fw-bold text-secondary mb-3">📅 Upcoming Tasks</h5>
          {summary.upcomingTasks.length > 0 ? (
            <ul className="list-group list-group-flush">
              {summary.upcomingTasks.map((task) => (
                <li
                  key={task._id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <span className="text-truncate" style={{ maxWidth: "70%" }}>
                    {task.name}
                  </span>
                  <span className="badge bg-primary text-white">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted mb-0">
              No upcoming tasks — you're all caught up!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
