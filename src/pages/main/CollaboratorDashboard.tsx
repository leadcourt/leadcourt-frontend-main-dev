import React, { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Eye,
  Search,
  Filter,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CollaboratorManager from "./CollaboratorManager";
import {
  getAcceptedInvitations,
  getAllInvitations,
  replyInvite,
} from "../../utils/api/collaborationAPI";
import { useSetRecoilState } from "recoil";
import { collabProjectState } from "../../utils/atom/collabAuthAtom";
import { toast } from "react-toastify";

interface Activity {
  id: string;
  type: "comment" | "edit" | "share" | "complete" | "invite";
  user: string;
  project: string;
  description: string;
  timestamp: string;
  avatar: string;
}

interface Invitation {
  _id: string;
  owner: string;
  ownerName: string;
  collaborator: string;
  collaboratorName: string;
  collaboratorEmail: string;
  permission: string;
  status: string;
  invitedAt: string;
  __v: number;
}

interface Project {
  _id: string;
  owner: string;
  ownerName: string;
  collaborator: string;
  collaboratorName: string;
  collaboratorEmail: string;
  permission: string;
  status: string;
  invitedAt: string;
  __v: 0;
}

const CollaboratorDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [loadingResponse, setLoadingResponse] = useState("");
  const collabState = useSetRecoilState(collabProjectState);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [activeTab, setActiveTab] = useState<"invites" | "team">("team");
  const [searchTerm, setSearchTerm] = useState("");
 
 
  const getStatusIcon = (status: any) => {
    switch (status) {
      case "Pending":
        return <AlertCircle className="w-4 h-4" />;
      case "Accepted":
        return <CheckCircle className="w-4 h-4" />;
      case "Declined":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "In Review":
        return "bg-blue-100 text-blue-800";
      case "Planning":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-gray-100 text-gray-800";
      case "On Hold":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Accepted":
        return "bg-green-100 text-green-800";
      case "Declined":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
 
  const renderProjects = () => (
    allProjects.length ? 
    <div className="space-y-6 max-w-6xl m-6 shadow rounded-xl p-3">
      {/* Header */}

      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Projects</h1>
      <div className="flex items-center justify-between ">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allProjects.map((project) => (
          <div
            key={project?._id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {project?.ownerName}
                </h3>
              </div>
              {/* <button className="p-1 hover:bg-gray-100 rounded">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button> */}
            </div>

            <div className="flex items-center justify-between">
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigateToProject(project)}
                    className="p-2 py-1 hover:bg-gray-100 bg-gray-200 flex items-center gap-2 rounded-2xl "
                  >
                    <Eye className="w-4 h-4 text-gray-700" />
                    <span className="text-gray-700 text-sm">Open</span>
                  </button>
                  {/* <button className="p-1 hover:bg-gray-100 rounded">
                    <Edit className="w-4 h-4 text-gray-400" />
                  </button> */}
                </div>
              </div>
              <span
                className={`px-2 py-1 mt-4 text-xs font-medium rounded-full ${getStatusColor(
                  "Active"
                )}`}
              >
                {/* {project.status} */}
                Active
              </span>
            </div>
          </div>
        ))}
      </div>
    </div> 
    : ''
  );

  const getInvitations = async () => {
    await getAllInvitations().then((res) => {

      if (res?.status === 200) {
        setInvitations(res?.data?.invites);
      } else {
        console.error("Failed to fetch invitations:");
      }
    });
  };
 

  const replyInvitation = async (collab: any, response: string) => {
    const payload = {
      _id: collab._id,
      action: response,
    };

    setLoadingResponse(response);

    await replyInvite(payload).then((res) => {

      if (res?.status === 200 && res?.data?.message === "Invite declined") {
        toast.success("Invitation Declined Successful");
      } else if (res?.status === 200) {
        toast.success("Invitation Accepted Successful");
      } else {
        toast.info("Please try again!");
      }
      setLoadingResponse("");
      
      collabProjects();
      getInvitations();
    });
  };

  const renderInvitations = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex gap-5 flex-col md:flex-row items-center md:justify-between">
        <div className="flex gap-5  flex-col md:flex-row items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search invites..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent">
            <option>All Status</option>
            <option>Pending</option>
            <option>Accepted</option>
            <option>Declined</option>
          </select>
        </div>
      </div>

      {/* Invitations Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invited By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invitations.map((invitation) => (
                <tr key={invitation._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {invitation.ownerName}
                    </div>
                    {/* <div className="text-sm text-gray-500">{invitation.email}</div> */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {invitation.permission}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(invitation.status)}
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          invitation.status
                        )}`}
                      >
                        {invitation.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invitation.invitedAt.split("T")[0]}{" "}
                    {/* Format date as needed */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {invitation.status === "pending" ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            replyInvitation(invitation, "accepted")
                          }
                          className={`flex items-center gap-2 ${getStatusColor(
                            "Accepted"
                          )} hover:bg-green-200 hover:text-green-900 px-3 py-1 rounded-2xl cursor-pointer`}
                        >
                          {/* <MoreVertical className="w-4 h-4" /> */}
                          {loadingResponse === "accepted" ? (
                            <i className="pi pi-spinner pi-spin"></i>
                          ) : (
                            <>{getStatusIcon("Accepted")}</>
                          )}

                          <p className=""> Accept</p>
                        </button>
                        <button
                          onClick={() =>
                            replyInvitation(invitation, "declined")
                          }
                          className={`flex items-center gap-2 ${getStatusColor(
                            "Declined"
                          )} hover:bg-red-200 hover:text-red-900 px-3 py-1 rounded-2xl cursor-pointer`}
                        >
                          {/* <MoreVertical className="w-4 h-4" /> */}
                          {loadingResponse === "declined" ? (
                            <i className="pi pi-spinner pi-spin"></i>
                          ) : (
                            <>{getStatusIcon("Declined")}</>
                          )}
                          <p className=""> Decline</p>
                        </button>
                        {/* <p>Decline</p> */}
                      </div>
                    ) : (
                      <div className="">
                        <button
                          onClick={() =>
                            replyInvitation(invitation, "declined")
                          }
                          className={`flex items-center gap-2  bg-red-200 text-red-900 px-3 py-1 rounded-2xl cursor-not-allowed`}
                        >
                          {/* <MoreVertical className="w-4 h-4" /> */}
                          {getStatusIcon("Declined")}
                          <p className=""> Declined</p>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
 
    </div>
  );

  const navigateToProject = (project: Project) => {
    const state = {
      _id: project._id,
      ownerName: project?.ownerName,
      collaborator: project?.collaborator,
      collaboratorName: project?.collaboratorName,
      collaboratorEmail: project?.collaboratorEmail,
      permission: project?.permission,
    };
    collabState(state);

    navigate(`/collaboration/${project?._id}/dashboard`);
  };

  const collabProjects = async () => {
    await getAcceptedInvitations().then((res) => {
      if (res?.status === 200) {
        setAllProjects(res?.data?.invites);
      } else {
        console.error("Failed to fetch collaborated projects:");
      } 
    });
  };

  useEffect(() => {
    collabProjects();
    getInvitations();
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Collaboration Dashboard
              </h1>
              <p className="text-gray-600">
                Track your projects and team activities
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-8 mt-6">
            {[
              { id: "team", label: "Team", icon: Activity },
              { id: "invites", label: "Invitations", icon: CheckCircle2 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-1 py-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">

        {/* Invitations Tab */}
        {activeTab === "invites" && (
          <div className="space-y-6">{renderInvitations()}</div>
        )}

        {/* Activity Tab */}
        {activeTab === "team" && (
          <div className="">
            <div className="space-y-6">{renderProjects()}</div>
            <CollaboratorManager />
          </div>
 
        )}
      </div>
    </div>
  );
};

export default CollaboratorDashboard;
