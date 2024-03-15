import React, { useState, useEffect } from "react";

interface Printer {
  _id: string;
  name: string;
  owner: string;
  printer?: boolean;
  presence: {
    updatedAt: Date;
    // The server the printer is connected to
    serverId: string;
    clientAddress?: string;
    httpHeader?: Record<string, string>;
    status: "online" | "offline";
  };
  printer_ids?: string[];
}

// Preimplimented function to get the users current id
// Function to get the already set user id, change this if you want to change users
function getUserId() {
  return "5";
}
// Function that tells us if we are an admin or not, assume this is set and you can
// adjust the return if you use a different user
function getUserIsAdmin() {
  return true;
}

export default function App(): JSX.Element {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [users, setUsers] = useState<Printer[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchPrinterInformation();
  }, [filterStatus, searchQuery]);

  async function fetchPrinterInformation(): Promise<void> {
    try {
      const response = await fetch(
        "http://localhost:4000/api/data"
      );
      const data = await response.json();

      // Filter printers based on user's admin status and search query
      let filteredPrinters = data.filter((printer: Printer) =>
        printer.printer && (getUserIsAdmin() || printer.owner === getUserId())
      );

      // Filter printers based on user's admin status and search query
      let justUsers = data.filter((printer: Printer) =>
        !printer.printer && getUserIsAdmin() 
      );

      // Apply filter based on status
      if (filterStatus !== "all") {
        filteredPrinters = filteredPrinters.filter(
          (printer: Printer) => printer.presence.status === filterStatus
        );
      }

      // Apply search filter
      if (searchQuery !== "") {
        filteredPrinters = filteredPrinters.filter((printer: Printer) =>
          printer.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
    
      setPrinters(filteredPrinters);
      setUsers(justUsers);
    } catch (error) {
      console.error(error);
    }
  }

  async function removePrinter(id: string): Promise<void> {
    try {
      // Send request to remove printer from the list
      // Assuming a DELETE request to a specific endpoint for removing printers

      await fetch(`http://localhost:4000/remove-printer/${id}`, {
        method: "DELETE",
      });

      // After successful removal, fetch updated printer information
      fetchPrinterInformation();
    } catch (error) {
      console.error(error);
    }
  }

  async function removePrinterFromUser(owner: string, PrinterId: string): Promise<void> {
    try {
      // Send request to remove printer from the user
      // Assuming a PATCH request to a specific endpoint for updating user's printer_ids
      await fetch(`http://localhost:4000/remove-printer-from-user/${owner}/${PrinterId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ owner }),
      });
  
      // After successful removal, fetch updated printer information
      fetchPrinterInformation();
    } catch (error) {
      console.error(error);
    }
  }

  function renderAdminOptions(printer: Printer): JSX.Element | null {
    if (getUserIsAdmin()) {
      return (
        <>
          <button className="margin-style" onClick={() => removePrinter(printer._id)}>Remove Printer</button>
          <button className="margin-style" onClick={() => removePrinterFromUser(printer.owner, printer._id)}>Remove User</button>
          <ul>
            {users.map((user: Printer) => (
              <div key={user._id}>
                <div>
                  {user._id === printer.owner && user.name }
                </div>
              </div>
            ))}
          </ul>
        </>
      );
    }
    return null;
  }

  return (
    <div className="center">
      <h1>Printer Information</h1>
      <div>
        <input
          type="text"
          placeholder="Search by printer name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="margin-style"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
      </div>
      <div className="mt-style" >
        <ul>
          {printers.map((printer: Printer) => (
            <li key={printer._id}>
              {printer.name} - Status: {printer.presence.status}
              {renderAdminOptions(printer)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
