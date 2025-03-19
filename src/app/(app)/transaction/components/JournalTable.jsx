"use client";

import formatNumber from "@/libs/formatNumber";
import formatDateTime from "@/libs/formatDateTime";
import axios from "@/libs/axios";
import { useState } from "react";
import Pagination from "@/components/PaginateList";
import { ArrowRightIcon, FilterIcon, LoaderCircleIcon, MessageCircleWarningIcon, PencilIcon, SearchIcon, TrashIcon } from "lucide-react";
import Modal from "@/components/Modal";
import Label from "@/components/Label";
import Input from "@/components/Input";
import EditJournal from "./EditJournal";
import TimeAgo from "@/libs/formatDateDistance";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const JournalTable = ({ cashBank, journalsByWarehouse, warehouses, warehouse, warehouseId, notification, fetchJournalsByWarehouse, user, loading }) => {
    const [selectedAccount, setSelectedAccount] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState(getCurrentDate());
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [isModalFilterJournalOpen, setIsModalFilterJournalOpen] = useState(false);
    const [isModalDeleteJournalOpen, setIsModalDeleteJournalOpen] = useState(false);
    const [isModalEditJournalOpen, setIsModalEditJournalOpen] = useState(false);
    const [selectedJournalId, setSelectedJournalId] = useState(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState(warehouse);
    const userRole = user?.role?.role;
    const warehouseCash = user?.role?.warehouse?.chart_of_account_id;
    const closeModal = () => {
        setIsModalFilterJournalOpen(false);
        setIsModalDeleteJournalOpen(false);
        setIsModalEditJournalOpen(false);
    };

    const filterSelectedJournalId = journalsByWarehouse?.data?.find((journal) => journal.id === selectedJournalId);

    const handleDeleteJournal = async (id) => {
        try {
            const response = await axios.delete(`/api/journals/${id}`);
            notification(response.data.message);
            fetchJournalsByWarehouse();
        } catch (error) {
            notification(error.response?.data?.message || "Something went wrong.");
        }
    };

    const branchAccount = cashBank.filter((cashBank) => cashBank.warehouse_id === Number(selectedWarehouse));
    const filteredJournals =
        journalsByWarehouse?.data?.filter((journal) => {
            const matchAccount =
                selectedAccount && (Number(journal.cred_code) === Number(selectedAccount) || Number(journal.debt_code) === Number(selectedAccount));

            const matchSearchTerm =
                searchTerm &&
                ((journal.debt?.acc_name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (journal.cred?.acc_name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (journal.description ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (journal.id ?? "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (journal.invoice ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (journal.amount ?? "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (journal.transaction ?? []).some((t) => (t.product?.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())));

            if (selectedAccount && searchTerm) {
                return matchAccount && matchSearchTerm;
            }

            if (selectedAccount) {
                return matchAccount;
            }

            if (searchTerm) {
                return matchSearchTerm;
            }

            return true;
        }) || [];

    const totalItems = filteredJournals?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredJournals.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    return (
        <div className="">
            <div className="px-4 flex gap-2">
                <select
                    onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                    }}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
                <select
                    onChange={(e) => {
                        setSelectedAccount(e.target.value);
                        setCurrentPage(1);
                    }}
                    value={selectedAccount}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                >
                    <option value="">Semua Akun</option>
                    {branchAccount.map((account, index) => (
                        <option key={index} value={account.id}>
                            {account.acc_name}
                        </option>
                    ))}
                </select>
                <button
                    onClick={() => setIsModalFilterJournalOpen(true)}
                    className="bg-white font-bold p-3 rounded-lg border border-gray-300 hover:border-gray-400"
                >
                    <FilterIcon className="size-4" />
                </button>
                <Modal isOpen={isModalFilterJournalOpen} onClose={closeModal} modalTitle="Filter Tanggal" maxWidth="max-w-md">
                    {userRole === "Administrator" && (
                        <div className="mb-4">
                            <Label>Cabang</Label>
                            <select
                                onChange={(e) => {
                                    setSelectedWarehouse(e.target.value);
                                    setCurrentPage(1);
                                }}
                                value={selectedWarehouse}
                                className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            >
                                <option value="">Semua Akun</option>
                                {warehouses?.data?.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div>
                            <Label>Tanggal</Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                        </div>
                        <div>
                            <Label>s/d</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                disabled={!startDate}
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            fetchJournalsByWarehouse(selectedWarehouse, startDate, endDate);
                            warehouseId(selectedWarehouse);

                            setIsModalFilterJournalOpen(false);
                            setSelectedAccount("");
                            setCurrentPage(1);
                        }}
                        className="btn-primary"
                    >
                        Submit
                    </button>
                </Modal>
            </div>
            <div className="px-4 pt-2 flex">
                <button className="rounded-l-lg bg-white p-2 border border-gray-300">
                    <SearchIcon size={20} />
                </button>
                <Input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="w-full rounded-e-lg rounded-l-none border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
            </div>
            <div className="px-4">
                <h4 className="text-xs text-slate-500">
                    {warehouses?.data?.find((w) => w.id === Number(selectedWarehouse))?.name} Periode {startDate} s/d {endDate}
                </h4>
            </div>
            <div className="overflow-x-auto">
                <table className="table w-full text-xs">
                    <thead>
                        <tr>
                            <th>Keterangan</th>
                            <th>Jumlah</th>
                            <th className="hidden sm:table-cell">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="text-center">
                                    <span className="text-sm text-slate-500">{loading ? "Loading..." : "No data found."}</span>
                                </td>
                            </tr>
                        ) : (
                            currentItems.map((journal, index) => (
                                <tr key={index} className="group hover:bg-slate-600 hover:text-white">
                                    <td>
                                        <span className="text-xs text-slate-500 group-hover:text-orange-300 block">
                                            #{journal.id} <span className="font-bold hidden sm:inline">{journal.invoice}</span>{" "}
                                            {formatDateTime(journal.created_at)}
                                        </span>
                                        Note: {journal.description}
                                        <span className="font-bold text-xs block">
                                            {journal.trx_type === "Voucher & SP" || journal.trx_type === "Accessories" ? (
                                                <ul className="list-disc font-normal scale-95">
                                                    {journal.transaction.map((trx) => (
                                                        <li key={trx.id}>
                                                            {trx.product.name} x {trx.quantity * -1}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : journal.trx_type === "Mutasi Kas" ? (
                                                journal.cred.acc_name + " -> " + journal.debt.acc_name
                                            ) : journal.debt_code === warehouseCash ? (
                                                journal.cred.acc_name
                                            ) : (
                                                journal.debt.acc_name
                                            )}
                                        </span>
                                        <span className="text-xs block text-slate-500 group-hover:text-white">
                                            Last update at <TimeAgo timestamp={journal.updated_at} />
                                        </span>
                                    </td>
                                    <td className="font-bold text-end text-slate-700 ">
                                        <span
                                            className={`${Number(journal.debt_code) === Number(selectedAccount) ? "text-green-500" : ""}
                                    ${Number(journal.cred_code) === Number(selectedAccount) ? "text-red-500" : ""}
                                        text-sm group-hover:text-yellow-400 sm:text-base xl:text-lg`}
                                        >
                                            {formatNumber(journal.amount)}
                                        </span>
                                        {journal.fee_amount !== 0 && (
                                            <span className="text-xs text-yellow-600 group-hover:text-white block">{formatNumber(journal.fee_amount)}</span>
                                        )}
                                    </td>
                                    <td className="">
                                        <div className="flex justify-center gap-3">
                                            <button
                                                className=" hover:scale-125 transtition-all duration-200"
                                                hidden={!["Transfer Uang", "Tarik Tunai"].includes(journal.trx_type)}
                                                onClick={() => {
                                                    setSelectedJournalId(journal.id);
                                                    setIsModalEditJournalOpen(true);
                                                }}
                                            >
                                                <PencilIcon className="size-4 text-indigo-700 group-hover:text-white" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedJournalId(journal.id);
                                                    setIsModalDeleteJournalOpen(true);
                                                }}
                                                disabled={["Voucher & SP", "Accessories"].includes(journal.trx_type)}
                                                className=" disabled:text-slate-300 disabled:cursor-not-allowed text-red-600 hover:scale-125 transtition-all group-hover:text-white duration-200"
                                            >
                                                <TrashIcon className="size-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalDeleteJournalOpen} onClose={closeModal} modalTitle="Confirm Delete" maxWidth="max-w-md">
                <div className="flex flex-col items-center justify-center gap-3 mb-4">
                    <MessageCircleWarningIcon size={72} className="text-red-600" />
                    <p className="text-sm">Apakah anda yakin ingin menghapus transaksi ini (ID: {selectedJournalId})?</p>
                </div>
                <div className="flex justify-center gap-3">
                    <button
                        onClick={() => {
                            handleDeleteJournal(selectedJournalId);
                            setIsModalDeleteJournalOpen(false);
                        }}
                        className="btn-primary w-full"
                    >
                        Ya
                    </button>
                    <button
                        onClick={() => setIsModalDeleteJournalOpen(false)}
                        className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Tidak
                    </button>
                </div>
            </Modal>
            <Modal isOpen={isModalEditJournalOpen} onClose={closeModal} modalTitle="Edit Journal" maxWidth="max-w-2xl">
                <EditJournal
                    isModalOpen={setIsModalEditJournalOpen}
                    journal={filterSelectedJournalId}
                    branchAccount={branchAccount}
                    notification={notification}
                    fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                />
            </Modal>
            {totalPages > 1 && (
                <Pagination
                    className="w-full px-4"
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default JournalTable;
