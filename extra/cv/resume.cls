% Identification

% \NeedsTeXFormat{LaTeX2e}
\ProvidesClass{resume}[2020/06/01 resume class]


% Preliminary Declarations

% Extend the article class
\LoadClass[10pt]{article}

%we use utf8 since we want to build from any machine
\usepackage[utf8]{inputenc}

% provides \isempty test
\usepackage{xifthen}

%----------------------------------------------------------------------------------------
%	FONT
%----------------------------------------------------------------------------------------

% some tex-live fonts - choose your own

%\usepackage[defaultsans]{droidsans}
%\usepackage[default]{comfortaa}
%\usepackage{cmbright}
\usepackage[default]{raleway}
%\usepackage{fetamont}
%\usepackage[default]{gillius}
%\usepackage[light,math]{iwona}
%\usepackage[thin]{roboto}

% set font default
\renewcommand*\familydefault{\sfdefault}
\usepackage[T1]{fontenc}

% more font size definitions
\usepackage{moresize}

%----------------------------------------------------------------------------------------
%	PAGE LAYOUT  DEFINITIONS
%----------------------------------------------------------------------------------------

%debug page outer frames
%\usepackage{showframe}


%define page styles using geometry
\usepackage[a4paper]{geometry}

% for example, change the margins to 2 inches all round
\geometry{top=1.25cm, bottom=-.6cm, left=1.5cm, right=1.5cm}

%use customized header
\usepackage{fancyhdr}
\pagestyle{fancy}

%less space between header and content
\setlength{\headheight}{-5pt}


%customize entries left, center and right
%\lhead{}
%\chead{}
%\rhead{}

%----------------------------------------------------------------------------------------
%	TABLE /ARRAY DEFINITIONS
%----------------------------------------------------------------------------------------

%for layouting tables
\usepackage{multicol}
\usepackage{multirow}

%extended aligning of tabular cells
\usepackage{array}

\newcolumntype{x}[1]{%
>{\raggedleft\hspace{0pt}}p{#1}}%


%indentation is zero
\setlength{\parindent}{0mm}

%============================================================================%
%
%
%	DEFINITIONS
%
%
%============================================================================%

%----------------------------------------------------------------------------------------
%	COLOR
%----------------------------------------------------------------------------------------

\usepackage{color}

%accent color
\definecolor{sectcol}{RGB}{0,150,255}

%dark background color
\definecolor{black}{RGB}{10,10,10}

%dark background color
\definecolor{bgcol}{RGB}{60,60,60}

%light background / accent color
\definecolor{softcol}{RGB}{205,205,205}

%----------------------------------------------------------------------------------------
% 	HEADER
%----------------------------------------------------------------------------------------

% remove top header line
\renewcommand{\headrulewidth}{0pt}

%remove botttom header line
\renewcommand{\footrulewidth}{0pt}

%remove pagenum
\renewcommand{\thepage}{}

%remove section num
\renewcommand{\thesection}{}


%----------------------------------------------------------------------------------------
% 	NEW COMMANDS
%----------------------------------------------------------------------------------------

% Add 'sections' to the input path
\newcommand{\cvsection}[1]
{
    \vspace{5mm}
	\begin{center}
		\large\textcolor{black}{\textbf{#1}}
	\end{center}
}

\newcommand{\metasection}[2]
{
%\begin{tabular*}{1\textwidth}{r r}
\footnotesize{#2} \hspace*{\fill} \footnotesize{#1}\\[1pt]
%\end{tabular*}
}

\newcommand{\cvevent}[4]
{
    \vspace{3mm}
    \begin{tabular*}{\textwidth}{p{13.6cm}  x{3.9cm}}
        \textcolor{black}{\textbf{#2}} - \textcolor{bgcol}{#3} \textcolor{sectcol}{#4} & \vspace{2.5pt}\textcolor{sectcol}{#1}
    \end{tabular*}

    \vspace{-8pt}
    \textcolor{softcol}{\hrule}
    \vspace{6pt}
}

% creates a stretched box as
\newcommand{\cveventmeta}[2]
{
	\mbox{\mystrut \hspace{87pt}\textit{#1}}\\
	#2
}
