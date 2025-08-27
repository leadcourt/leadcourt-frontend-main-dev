import { useCallback, useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  collabCreditState,
  collabProjectState,
} from "../../utils/atom/collabAuthAtom";
import { toast } from "react-toastify";
import TextToCapitalize from "../../component/TextToCapital";
import FilterComponent from "../../component/FilterComponent";
import { Skeleton } from "primereact/skeleton";
import noDataImg from "../../assets/icons/nodataImage.jpg";
import { debounce } from "lodash";
import { Dropdown } from "primereact/dropdown";
import { useNavigate } from "react-router-dom";
import { getCollabCreditBalance } from "../../utils/api/collaborationAPI";
import {
  collaboration_getAllData_api,
  collaboration_getLinkedInUrl_api,
  collaboration_showPhoneAndEmail_api,
} from "../../utils/api/collaborationData";
import CollaboratorAddToListComponent from "../../component/collaborator/CollaboratorAddToListComponent";


interface Person {
  City: string;
  Country: string;
  Designation: string;
  Name: string;
  Organization: string;
  State: string;
  row_id: number;
  Email: any;
  Phone: any;
}

interface LoadDataOptions {
  rowLimit?: number;
  filter?: any;
}


export default function Collab_DataTablePage() {
  const creditInfo = useSetRecoilState(collabCreditState);
  const creditInfoValue = useRecoilValue(collabCreditState);

  const [pageNumber, setPageNumber] = useState<number>(1);
  const [entries, setEntries] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState<any>({});
  const user = useRecoilValue(collabProjectState);
  const [selectedProfile, setSelectedProfile] = useState([]);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [rowClick, setRowClick] = useState(false);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRowLimit, setSelectedRowLimit] = useState<number>(25);
  const [loadRow, setLoadRow] = useState<any>({});
  const [visible, setVisible] = useState<boolean>(false);

  const navigate = useNavigate();

  const r_Limit: number[] = [25, 50, 100];

  const changeRowLimit = (value: any) => {
    setSelectedRowLimit(value);
    loadData(pageNumber, { rowLimit: value });
  };
  const addToList = () => {
    if (selectedProfile.length !== 0) {
      setModalVisible(true);
    } else {
      toast.error("Select atleast one person");
    }
  };

  const onGlobalFilterChange = (e: any) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const loadingColumns = [
    {
      row_id: "",
      Name: "",
      Designation: "",
      Email: "",
      LinkedIn: "",
      Phone: "",
      Organization: "",
      City: "",
      State: "",
      Country: "",
      "Organization Size": "",
      "Organization Industry": "",
    },
  ];

  const columns = [
    { field: "Name", header: "Name" },
    { field: "Designation", header: "Designation" },
    { field: "Phone", header: "Phone" },
    { field: "Email", header: "Email" },
    { field: "", header: "LinkedIn" },
    { field: "Organization", header: "Organization" },
    { field: "Org Industry", header: "Organization Industry" },
    { field: "Org Size", header: "Organization Size" },
    { field: "City", header: "City" },
    { field: "State", header: "State" },
    { field: "Country", header: "Country" },
  ];

  const fields = columns.map((item) => {
    return item.field;
  });

  const debouncedFetchData = useRef(
    debounce(async (payload: any) => {

      try {
        const res = await collaboration_getAllData_api(payload);
        const data = res?.data?.cleaned?.sort((a: Person, b: Person): number =>
          a.Name.localeCompare(b.Name)
        );
        setTotalDataCount(res?.data?.count);
        setEntries(data);
      } catch (error) {
        console.error("Fetch failed");
      } finally {
        setLoading(false);
      }
    }, 2000)
  ).current;

  const loadData = useCallback(
    (pageNo: number, { rowLimit, filter }: LoadDataOptions = {}) => {
      setLoading(true);
      const payload = {
        filters: filter ?? selectedFilters,
        page: pageNo,
        userId: user?._id,
        limit: rowLimit ?? selectedRowLimit,
      };
      debouncedFetchData(payload);
    },
    [selectedFilters, user?._id, selectedRowLimit]
  );

  const handleChangePageNumber = (e: any) => {
    e.preventDefault();
    const num: number = parseInt(e.target.value);
    setPageNumber(num);
    loadData(num, { filter: selectedFilters });
  };

  const handleChangePageNumber2 = (chk: string) => {
    if (chk === "increase") {
      setPageNumber(pageNumber + 1);
      loadData(pageNumber + 1, { filter: selectedFilters });
    } else if (chk === "decrease") {
      setPageNumber(pageNumber - 1);
      loadData(pageNumber - 1, { filter: selectedFilters });
    }
  };

  const handleShowPhoneOrEmail = async (type: string, id: any) => {
    setLoadRow({ type: type, row_id: id });

    await collaboration_showPhoneAndEmail_api(type, [id], user)
      .then((res) => {

        if (res?.data?.error) {
          setVisible(true);
        }
        let prevEntries: any = {};

        prevEntries = entries.map((entry: any) =>
          entry.row_id === id
            ? { ...entry, ...res?.data.results[0] } 
            : entry
        );
        creditInfo({
          id: user?._id ?? "",
          credits: res?.data?.remainingCredits || 0,
          subscriptionType: creditInfoValue?.subscriptionType || "FREE",
        });
 
        setEntries(prevEntries);
      })
      .catch(() => {
      });

    setLoadRow({});
  };

  const openLinkedInPopup = async (id: any) => {
    setLoadRow({ type: "linkedIn", row_id: id });
    const payload = {
      row_id: id,
    };

    await collaboration_getLinkedInUrl_api(payload).then((res: any) => {
      window.open(
        `https://${res?.data?.linkedin_url}`,
        "popupWindow",
        "width=600,height=600"
      );
      setLoadRow({});
    });
  };

  const showPhone = (rowData: any) => {
    return (
      <div className="">
        {!rowData.Phone ? (
          <div
            onClick={() => handleShowPhoneOrEmail("phone", rowData.row_id)}
            className="text-xs cursor-pointer w-fit p-2 flex items-center justify-center gap-2 button_hover font-bold rounded-lg"
          >
            {loadRow?.type === "phone" && loadRow.row_id === rowData.row_id ? (
              <i className="pi pi-spin pi-spinner"></i>
            ) : (
              <i className="pi pi-phone text-xs"></i>
            )}
            <span>Show Phone</span>
          </div>
        ) : (
          rowData.Phone
        )}
      </div>
    );
  };

  const showEmail = (rowData: any) => {
    return (
      <div className="">
        {!rowData.Email ? (
          <div
            onClick={() => handleShowPhoneOrEmail("email", rowData.row_id)}
            className="text-xs cursor-pointer w-fit p-2 flex items-center justify-center gap-2 button_hover font-bold rounded-lg"
          >
            {loadRow?.type === "email" && loadRow.row_id === rowData.row_id ? (
              <i className="pi pi-spin pi-spinner"></i>
            ) : (
              <i className="pi pi-inbox text-xs"></i>
            )}
            <span>Show Email</span>
          </div>
        ) : (
          rowData.Email
        )}
      </div>
    );
  };

  const showLinkedIn = (rowData: any) => {
    return (
      <div className="">
        <i
          onClick={() => openLinkedInPopup(rowData.row_id)}
          className={`
      
            ${
              loadRow?.type === "linkedIn" && loadRow.row_id === rowData.row_id
                ? "pi pi-spinner"
                : "pi pi-address-book"
            }
          button_hover font-bold text-2xl cursor-pointer rounded-lg p-2 `}
        ></i>
      </div>
    );
  };

  const showName = (rowData: any) => {
    return <div className="">{TextToCapitalize(rowData.Name)}</div>;
  };

  const showDesignation = (rowData: any) => {
    return <div className="">{TextToCapitalize(rowData.Designation)}</div>;
  };

  const showCity = (rowData: any) => {
    return <div className="">{TextToCapitalize(rowData.City)}</div>;
  };

  const showState = (rowData: any) => {
    return <div className="">{TextToCapitalize(rowData.State)}</div>;
  };

  const showCountry = (rowData: any) => {
    return <div className="">{TextToCapitalize(rowData.Country)}</div>;
  };

  const showOrganization = (rowData: any) => {
    return <div className="">{TextToCapitalize(rowData.Organization)}</div>;
  };

  const showOrgIndustry = (rowData: any) => {
    return (
      <div className="">
        {TextToCapitalize(rowData?.["Organization Industry"])}
      </div>
    );
  };

  const skeletonLoad = () => {
    return <Skeleton height="2rem" className="mb-2 bg-[#f34f1415] "></Skeleton>;
  };

  const emptyMessageTemplate = () => {
    return (
      <div className="text-2xl sticky max-w-full w-1/2 m-auto ">
        {/* NO dataaaaaaaaimpo */}
        <img src={noDataImg} className="w-full" alt="" />
        {/* <noDataImg /> */}
      </div>
    );
  };

  const getCredit = async () => {
    await getCollabCreditBalance().then((res) => {
      creditInfo({
        id: user?._id ?? "",
        credits: res?.data?.credits,
        subscriptionType: res?.data?.subscriptionType,
      });
    });
  };

  useEffect(() => {
    getCredit();
    loadData(pageNumber);
    setRowClick(false);
    setSelectedFilters({});
  }, []);

  return (
    <div className="lg:h-[90vh]">
      <Dialog
        header={`Insufficient Credits`}
        visible={visible}
        className="p-2 bg-white w-fit max-w-[400px] lg:w-1/2"
        onHide={() => {
          if (!visible) return;
          setVisible(false);
        }}
        draggable={false}
        resizable={false}
      >
        <div className=" w-fit m-auto">
          <div className="flex flex-col gap-3 m-5 text-center">
            <p className="flex">
              <i className="pi pi-exclamation-triangle text-yellow-700 p-1 rounded"></i>
              <span className=" text-sm">
                You have insufficient credits to view this profile(s).
              </span>
            </p>
          </div>

          <div className="mt-6 flex items-center pb-2"> 

            <div className=" cursor-pointer w-fit m-auto">
              <button
                onClick={() => navigate("/subscription")}
                className="bg-[#F35114] flex items-center gap-2 cursor-pointer text-white text-md rounded-full px-6 py-2"
              >
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      </Dialog>
      <div className="grid grid-cols-12 overflow-hidden">
        {/* The filter section */}
        <div className=" border-r border-r-gray-200 col-span-12 lg:col-span-3 gap-3 lg:gap-0 p-3 maxh-[100vh] overflow-y-auto overflow-x-hidden static">
          {/* {keyFilters.Designation} */}
          <h2 className="font-bold col-span-12 mb-5 text-2xl text-gray-600">
            Filters
          </h2>

          <FilterComponent
            functionName={loadData}
            setFitler={setSelectedFilters}
            setPage={setPageNumber}
          />
        </div>

        {/* The table section */}
        <div className="ml-5 col-span-12 lg:col-span-9">
          <div className="card ">
            <div className="max-w-[100vw] flex flex-col-reverse lg:flex-row gap-5 lg: items-center justify-between p-2">
              {/* Global filter */}
              <div className="flex items-center gap-3 border border-gray-300 text-gray-500 rounded-lg p-3   w-full md:w-[30%] max-w-[400px]">
                <i className="pi pi-search"></i>
                <input
                  value={globalFilterValue}
                  onChange={onGlobalFilterChange}
                  placeholder="Keyword Search"
                  className="border-none text-sm focus:outline-none "
                />
              </div>

              {/* Add to list button and pop-up section */}
              <div className="flex flex-col gap-5 min-w-1/2 justify-end lg:flex-row items-center">
                <Dialog
                  header="Add Profiles to list"
                  visible={modalVisible}
                  className="p-2 bg-white w-[90vw] lg:w-1/2"
                  onHide={() => {
                    if (!modalVisible) return;
                    setModalVisible(false);
                  }}
                >
                  {/* Add to list pop up section */}
                  <CollaboratorAddToListComponent
                    onClose={() => setModalVisible(false)}
                    people={selectedProfile}
                  />
                </Dialog>

                <Button
                  label="Add to list"
                  icon="pi pi-plus"
                  onClick={() => addToList()}
                  className="flex gap-3 border border-gray-500 text-sm focus:outline-none text-gray-500 hover:bg-gray-500 hover:text-white  transition-colors duration-200 w-full lg:min-w-fit py-3 px-4 cursor-pointer font-medium rounded-md"
                ></Button>
                <div
                  className="secondary-btn-red w-full lg:min-w-fit flex justify-center gap-5"
                >
                  {/* <i className="pi pi-plus"></i> */}
                  <p className=" text-sm">
                    Show {totalDataCount?.toLocaleString()} people
                  </p>
                </div>
              </div>
            </div>
            <div className=" w[100vw]  overflow-hidden overflow-y-auto scrollbar-hide max-h-[70vh]">
              {loading ? (
                <DataTable
                  value={Array(10).fill(loadingColumns)}
                  filters={filters}
                  globalFilterFields={fields}
                  tableStyle={{ minWidth: "100%" }}
                  dataKey="row_id"
                  scrollable 
                  scrollHeight="70vh" 
                  className="text-sm rounded-lg overflow-hidden"
                  rows={50}
                  selectionMode={rowClick ? null : "checkbox"}
                  onSelectionChange={(e: any) => setSelectedProfile(e.value)}
                  selection={selectedProfile}
                  paginatorTemplate="RowsPerPageDropdown PrevPageLink PageLinks NextPageLink CurrentPageReport"
                >
                  <Column
                    selectionMode="multiple"
                    headerClassName={"bg-[#F35114] p-3 "}
                    className="bg-[#f34f146c] text-center"
                    headerStyle={{ width: "3rem" }}
                  ></Column>

                  {columns.map((col) => (
                    <Column
                      key={col.field}
                      field={col.field}
                      className={`text-sm py-3 border-b border-gray-100 p-5 ${
                        col.header === "User"
                          ? "font-bold text-gray-700"
                          : "text-gray-500"
                      }  `}
                      body={
                        col.field === "Phone"
                          ? skeletonLoad
                          : col.field === "Email"
                          ? skeletonLoad
                          : col.field === "Name"
                          ? skeletonLoad
                          : col.field === ""
                          ? skeletonLoad
                          : col.field === "Designation"
                          ? skeletonLoad
                          : col.field === "City"
                          ? skeletonLoad
                          : col.field === "State"
                          ? skeletonLoad
                          : col.field === "Country"
                          ? skeletonLoad
                          : col.field === "Organization"
                          ? skeletonLoad
                          : col.field === "Org Industry"
                          ? skeletonLoad
                          : col.field === "Org Size"
                          ? skeletonLoad
                          : null
                      }
                      header={col.header}
                      headerClassName={"bg-[#F35114] text-white p-3 min-w-50"}
                    />
                  ))}
                </DataTable>
              ) : (
                <DataTable
                  value={entries}
                  filters={filters}
                  globalFilterFields={fields}
                  tableStyle={{ minWidth: "100%" }}
                  dataKey="row_id"
                  emptyMessage={emptyMessageTemplate}
                  scrollable 
                  scrollHeight="70vh" 
                  className="text-sm rounded-lg overflow-hidden"
                  rows={50}
                  selectionMode={rowClick ? null : "checkbox"}
                  onSelectionChange={(e: any) => setSelectedProfile(e.value)}
                  selection={selectedProfile}
                  paginatorTemplate="RowsPerPageDropdown PrevPageLink PageLinks NextPageLink CurrentPageReport"
                >
                  <Column
                    selectionMode="multiple"
                    headerClassName={"bg-[#F35114] p-3 "}
                    className="bg-[#f34f146c] text-center"
                    headerStyle={{ width: "3rem" }}
                  ></Column>

                  {columns.map((col) => (
                    <Column
                      key={col.field}
                      field={col.field}
                      className={`text-xs py-3 border-b border-gray-100 text-gray-500 p-1 `}
                      body={
                        col.field === "Phone"
                          ? showPhone
                          : col.field === "Email"
                          ? showEmail
                          : col.field === "Name"
                          ? showName
                          : col.field === ""
                          ? showLinkedIn
                          : col.field === "Designation"
                          ? showDesignation
                          : col.field === "City"
                          ? showCity
                          : col.field === "State"
                          ? showState
                          : col.field === "Country"
                          ? showCountry
                          : col.field === "Organization"
                          ? showOrganization
                          : col.field === "Organization Industry"
                          ? showOrgIndustry
                          : null
                      }
                      header={col.header}
                      headerClassName={"bg-[#F35114] text-white p-3 min-w-50"}
                    />
                  ))}
                </DataTable>
              )}
            </div>
          </div>
          {/* pagination */}
          <div className="p-10 lg:p-0 md:flex items-center m-auto">
            <div className="text-xs w-full m-auto md:flex items-center justify-center gap-5">
              <div className="text-gray-500 h-fit  w-fit m-auto flex items-center gap-2">
                Rows / page
                <Dropdown
                  value={selectedRowLimit}
                  onChange={(e) => changeRowLimit(e.value)}
                  options={r_Limit}
                  optionLabel="name"
                  panelClassName="rounded !w-fit"
                  itemTemplate={(option) => (
                    <div className="text-sm p-2 text-gray-600 hover:bg-red-200 cursor-pointer">
                      {option}
                    </div>
                  )}
                  collapseIcon={undefined}
                  dropdownIcon=""
                  placeholder="25"
                  className="w-fit rounded border-red-200 border focus:outline-none text-xs p-1"
                />
              </div>
              <div className=" w-fit m-auto my-2 flex">
                <i
                  className="pi pi-angle-left text-2xl text-gray-300 p-3 cursor-pointer"
                  onClick={() => handleChangePageNumber2("decrease")}
                ></i>

                <input
                  type="number"
                  value={pageNumber}
                  max={totalDataCount}
                  className="max-w-[100px] text-center order py-2 focus:outline-gray-100 focus:outline-1 rounded"
                  onChange={(e) => handleChangePageNumber(e)}
                />

                <i
                  className="pi pi-angle-right text-2xl text-gray-300 p-3 cursor-pointer"
                  onClick={() => handleChangePageNumber2("increase")}
                ></i>
              </div>

              <div className="m-auto w-fit text-gray-500">
                {" "}
                {totalDataCount
                  ? Math.round(totalDataCount / 25).toLocaleString()
                  : 0}{" "}
                pages
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
