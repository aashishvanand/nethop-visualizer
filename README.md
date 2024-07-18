# NetHop Visualizer

NetHop Visualizer is an interactive web application that allows users to visualize the path of their network connections using traceroute data. This tool helps in understanding network topology and diagnosing connectivity issues.

## Features

- Generate traceroute commands for different operating systems (Linux, Mac, Windows)
- Parse and visualize traceroute output
- Interactive map display of network hops
- Dark and light theme support
- Responsive design for various screen sizes

## Getting Started

### Prerequisites

- Node.js (version 18 or later)
- npm

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/aashishvanand/nethop-visualizer.git
   ```

2. Navigate to the project directory:
   ```
   cd nethop-visualizer
   ```

3. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

4. Run the development server:
   ```
   npm run dev
   ```
   or
   ```
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Enter a domain or IP address in the input field.
2. Select your operating system.
3. Copy the generated command and run it in your terminal.
4. Paste the output back into the application.
5. Click "Map Route" to visualize the network path.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
